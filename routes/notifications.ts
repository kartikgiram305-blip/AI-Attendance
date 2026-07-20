const express = require('express');
const router = express.Router();
const db = require('../db');
const twilio = require('twilio');
const mailjet = require('node-mailjet');

router.get('/preview', (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: 'date required' });
  
  const absentees = db.prepare("SELECT student_id FROM attendance WHERE date = ? AND status = 'A' AND notification_sent = 0").all(date);
  
  let emails = 0;
  let sms = 0;
  let calls = 0;
  
  for (const a of absentees) {
    const student = db.prepare("SELECT * FROM students WHERE id = ?").get(a.student_id);
    const totalAbsences = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = 'A'").get(student.id).count;
    
    if (totalAbsences > 0) {
      const hasEmail = student.email && student.email.trim() !== '' && student.email !== 'no-email@domain.com';
      const hasContact = student.contact_number && student.contact_number.trim() !== '' && student.contact_number !== '0000000000';
      
      if (totalAbsences >= 6) {
        if (hasContact) calls++;
      } else {
        if (hasEmail) emails++;
        if (hasContact) sms++;
      }
    }
  }
  
  res.json({ emails, sms, calls });
});

router.post('/send', async (req, res) => {
  const { date } = req.body;
  
  const absentees = db.prepare("SELECT student_id FROM attendance WHERE date = ? AND status = 'A' AND notification_sent = 0").all(date);
  const updateStmt = db.prepare("UPDATE attendance SET notification_sent = 1 WHERE student_id = ? AND date = ?");
  
  let twilioClient = null;
  let mj = null;
  
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  if (process.env.MAILJET_API_KEY && process.env.MAILJET_API_SECRET) {
      mj = mailjet.apiConnect(process.env.MAILJET_API_KEY, process.env.MAILJET_API_SECRET);
  }
  
  for (const a of absentees) {
    const student = db.prepare("SELECT * FROM students WHERE id = ?").get(a.student_id);
    const totalAbsences = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = 'A'").get(student.id).count;
    
    const hasEmail = student.email && student.email.trim() !== '' && student.email !== 'no-email@domain.com';
    const hasContact = student.contact_number && student.contact_number.trim() !== '' && student.contact_number !== '0000000000';

    try {
      if (totalAbsences >= 6) {
        if (hasContact && twilioClient && process.env.TWILIO_PHONE_NUMBER) {
          await twilioClient.calls.create({
            twiml: `<Response>
                      <Gather input="speech" action="/api/notifications/twilio-voice-callback" timeout="5">
                        <Say>Alert from Attend A I. ${student.name} has been marked absent. This is their ${totalAbsences}th absence. Please state the reason for this absence after the beep.</Say>
                      </Gather>
                      <Say>We didn't receive any input. Goodbye.</Say>
                    </Response>`,
            to: student.contact_number,
            from: process.env.TWILIO_PHONE_NUMBER
          });
        }
      } else {
        if (hasContact && twilioClient && process.env.TWILIO_PHONE_NUMBER) {
           await twilioClient.messages.create({
             body: `AttendAI: ${student.name} was marked absent today (${date}).`,
             from: process.env.TWILIO_PHONE_NUMBER,
             to: student.contact_number
           });
        }
        if (hasEmail && mj && process.env.MAILJET_FROM_EMAIL) {
           await mj.post("send", { 'version': 'v3.1' }).request({
              Messages: [{
                From: { Email: process.env.MAILJET_FROM_EMAIL, Name: "AttendAI" },
                To: [{ Email: student.email, Name: student.name }],
                Subject: "Absence Notification",
                TextPart: `Dear Parent/Guardian, \n\n${student.name} was marked absent on ${date}. \n\nRegards, \nAttendAI System`
              }]
           });
        }
      }
      updateStmt.run(student.id, date);
    } catch(err) {
      console.error(`Failed to notify for ${student.name}:`, err.message);
    }
  }

  res.json({ success: true, message: 'Notifications sent successfully' });
});

// --- Twilio Voice Webhook Callback ---
router.post('/twilio-voice-callback', express.urlencoded({ extended: false }), (req, res) => {
  const parentResponse = req.body.SpeechResult;
  const incomingCallTo = req.body.To;

  const twiml = new twilio.twiml.VoiceResponse();
  
  if (parentResponse) {
    twiml.say('Thank you for providing the reason. Your response has been logged by Attend AI. Goodbye.');
    
    try {
      const student = db.prepare("SELECT id FROM students WHERE contact_number = ?").get(incomingCallTo);
      if (student) {
        const recentAbsence = db.prepare("SELECT date FROM attendance WHERE student_id = ? AND status = 'A' ORDER BY date DESC LIMIT 1").get(student.id);
        if (recentAbsence) {
          db.prepare("UPDATE attendance SET reason = ? WHERE student_id = ? AND date = ?").run(parentResponse, student.id, recentAbsence.date);
        }
      }
    } catch (err) {
      console.error('Database log update failed during webhook:', err.message);
    }
  } else {
    twiml.say('No voice response detected. Attend AI will notify the teacher. Goodbye.');
  }

  res.type('text/xml');
  res.send(twiml.toString());
});

module.exports = router;
