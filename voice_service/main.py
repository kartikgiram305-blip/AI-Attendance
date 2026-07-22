"""
Attend AI – Voice Service
FastAPI server bridging Twilio Media Streams with Hugging Face Inference API.
Dynamically scales call strictness based on student absence count.
"""

import os
import json
import base64
import logging
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
load_dotenv()

HUGGINGFACE_API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN", "")
HF_MODEL_ID = "meta-llama/Meta-Llama-3-8B-Instruct"
HF_API_URL = f"https://api-inference.huggingface.co/models/{HF_MODEL_ID}"

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("voice_service")

app = FastAPI(title="Attend AI Voice Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Prompt Builder – scales tone by absence count
# ---------------------------------------------------------------------------
def build_system_prompt(student_name: str, absence_count: int) -> str:
    """Return a system prompt whose strictness scales with *absence_count*."""

    if absence_count <= 2:
        tone = (
            "You are a warm, polite school attendance assistant. "
            "Speak in a friendly, informational tone. "
            "Gently inform the parent about the absences and encourage regular attendance. "
            "Be empathetic and understanding."
        )
        severity = "minor"
    elif absence_count <= 5:
        tone = (
            "You are a firm, authoritative school attendance officer. "
            "Speak in a professional, policy-focused tone. "
            "Clearly state the school's attendance policy and the consequences of continued absences. "
            "Be direct but respectful."
        )
        severity = "concerning"
    else:
        tone = (
            "You are a strict, serious school administrator. "
            "Speak in an unyielding, no-nonsense tone. "
            "Emphasize that this level of absenteeism is unacceptable and triggers mandatory escalation "
            "to the school principal and administrative review board. "
            "Make it clear that immediate corrective action is required."
        )
        severity = "critical"

    return (
        f"{tone}\n\n"
        f"You are calling the parent/guardian of {student_name}. "
        f"The student currently has {absence_count} unexcused absence(s), "
        f"which is considered {severity}.\n\n"
        "Keep your responses concise and suitable for a phone conversation (2-3 sentences max). "
        "Do not use markdown, bullet points, or any formatting — speak naturally as if on a phone call."
    )


# ---------------------------------------------------------------------------
# Hugging Face Inference (synchronous requests, called in async context)
# ---------------------------------------------------------------------------
def query_llm_sync(system_prompt: str, user_message: str) -> str:
    """Send a chat completion request to the Hugging Face Inference API."""

    headers = {
        "Authorization": f"Bearer {HUGGINGFACE_API_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "inputs": (
            f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n"
            f"{system_prompt}<|eot_id|>"
            f"<|start_header_id|>user<|end_header_id|>\n\n"
            f"{user_message}<|eot_id|>"
            f"<|start_header_id|>assistant<|end_header_id|>\n\n"
        ),
        "parameters": {
            "max_new_tokens": 150,
            "temperature": 0.7,
            "top_p": 0.9,
            "do_sample": True,
            "return_full_text": False,
        },
    }

    try:
        response = requests.post(HF_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()
        result = response.json()

        if isinstance(result, list) and len(result) > 0:
            return result[0].get("generated_text", "").strip()
        return "I'm sorry, I wasn't able to generate a response at this time."

    except requests.exceptions.HTTPError as e:
        logger.error("HF API HTTP error: %s – %s", e.response.status_code, e.response.text)
        return "I apologize, but I'm experiencing a temporary issue. Please hold."
    except Exception as e:
        logger.error("HF API error: %s", str(e))
        return "I apologize, but I'm experiencing a temporary issue. Please hold."


async def query_llm(system_prompt: str, user_message: str) -> str:
    """Async wrapper around synchronous HF call (uses thread pool)."""
    import asyncio
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, query_llm_sync, system_prompt, user_message)


# ---------------------------------------------------------------------------
# Utility – create a silent mulaw audio frame (for sending back to Twilio)
# ---------------------------------------------------------------------------
def generate_silence_frame(duration_ms: int = 20) -> str:
    """
    Generate a base64-encoded silent mulaw audio frame.
    mulaw silence byte = 0xFF, sample rate = 8000 Hz, 1 byte per sample.
    """
    num_bytes = int(8000 * (duration_ms / 1000))
    silence = bytes([0xFF] * num_bytes)
    return base64.b64encode(silence).decode("ascii")


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "voice_service", "version": "2.0.0"}


# ---------------------------------------------------------------------------
# Twilio Media Stream WebSocket
# ---------------------------------------------------------------------------
@app.websocket("/ws/call")
async def twilio_media_stream(
    websocket: WebSocket,
    student: str = Query("Unknown Student"),
    absences: int = Query(1),
):
    """
    Handle Twilio's bi-directional Media Stream.

    Twilio sends JSON messages with these event types:
      • connected  – WebSocket connection established
      • start      – stream metadata (call SID, track, etc.)
      • media      – base64-encoded audio chunk (mulaw 8kHz)
      • stop       – stream ended

    We send audio back as:
      {"event": "media", "streamSid": "<sid>", "media": {"payload": "<base64_audio>"}}
    """
    await websocket.accept()
    logger.info("WebSocket accepted – student=%s, absences=%d", student, absences)

    system_prompt = build_system_prompt(student, absences)
    stream_sid: Optional[str] = None
    audio_buffer: bytearray = bytearray()

    # Pre-generate the opening greeting
    greeting = await query_llm(
        system_prompt,
        "The call has just connected. Introduce yourself and state the reason for the call.",
    )
    logger.info("AI greeting: %s", greeting)

    try:
        while True:
            raw = await websocket.receive_text()
            message = json.loads(raw)
            event = message.get("event")

            # ----------------------------------------------------------
            # connected – Twilio confirms the WS connection
            # ----------------------------------------------------------
            if event == "connected":
                logger.info("Twilio connected: %s", message.get("protocol", "unknown"))

            # ----------------------------------------------------------
            # start – stream metadata (capture streamSid)
            # ----------------------------------------------------------
            elif event == "start":
                start_data = message.get("start", {})
                stream_sid = start_data.get("streamSid")
                logger.info(
                    "Stream started – SID=%s, callSid=%s, tracks=%s",
                    stream_sid,
                    start_data.get("callSid"),
                    start_data.get("tracks"),
                )

                # Send the AI greeting as a mark (text-to-speech placeholder).
                # In production, convert `greeting` via a TTS engine and
                # send it as a proper media event below.
                if stream_sid:
                    # --- Mark with greeting text ---
                    mark_msg = {
                        "event": "mark",
                        "streamSid": stream_sid,
                        "mark": {"name": "greeting", "text": greeting},
                    }
                    await websocket.send_text(json.dumps(mark_msg))

                    # --- Placeholder silent audio frame (keeps stream alive) ---
                    silent_payload = generate_silence_frame(duration_ms=100)
                    media_msg = {
                        "event": "media",
                        "streamSid": stream_sid,
                        "media": {"payload": silent_payload},
                    }
                    await websocket.send_text(json.dumps(media_msg))

            # ----------------------------------------------------------
            # media – inbound audio from caller (base64 mulaw 8kHz)
            # ----------------------------------------------------------
            elif event == "media":
                media_data = message.get("media", {})
                payload_b64 = media_data.get("payload", "")

                if payload_b64:
                    # Decode base64 audio chunk
                    audio_chunk = base64.b64decode(payload_b64)
                    audio_buffer.extend(audio_chunk)

                    # Process audio in ~1-second windows (8000 bytes ≈ 1s at 8kHz mulaw)
                    if len(audio_buffer) >= 8000:
                        logger.info(
                            "Received ~%d bytes of audio from caller",
                            len(audio_buffer),
                        )

                        # In production: pipe audio_buffer → STT engine → transcript
                        # For now, generate a contextual AI response directly.
                        ai_response = await query_llm(
                            system_prompt,
                            "The parent has responded to your message. "
                            "Continue the conversation appropriately.",
                        )
                        logger.info("AI response: %s", ai_response)

                        # Send AI response back to Twilio as media + mark
                        if stream_sid:
                            # Mark with AI text
                            response_mark = {
                                "event": "mark",
                                "streamSid": stream_sid,
                                "mark": {"name": "ai_response", "text": ai_response},
                            }
                            await websocket.send_text(json.dumps(response_mark))

                            # Send a silent audio frame (placeholder for real TTS audio)
                            silent_payload = generate_silence_frame(duration_ms=100)
                            response_media = {
                                "event": "media",
                                "streamSid": stream_sid,
                                "media": {"payload": silent_payload},
                            }
                            await websocket.send_text(json.dumps(response_media))

                        audio_buffer.clear()

            # ----------------------------------------------------------
            # stop – stream ended
            # ----------------------------------------------------------
            elif event == "stop":
                logger.info("Stream stopped – SID=%s", stream_sid)
                break

            else:
                logger.debug("Unhandled event type: %s", event)

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected – SID=%s", stream_sid)
    except json.JSONDecodeError as e:
        logger.error("Invalid JSON from Twilio: %s", str(e))
    except Exception as e:
        logger.error("Unexpected error in WS handler: %s", str(e))
    finally:
        logger.info("Cleaning up stream – SID=%s", stream_sid)


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")
