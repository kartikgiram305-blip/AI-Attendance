<?php
namespace App\Controllers;

use App\Config\Database;
use Twilio\TwiML\VoiceResponse;

class NotificationsController {
    public function preview() {
        $date = isset($_GET['date']) ? $_GET['date'] : null;
        if (!$date) {
            http_response_code(400);
            echo json_encode(['error' => 'date required']);
            return;
        }
        
        $pdo = Database::getConnection();
        
        $absenteesStmt = $pdo->prepare("SELECT student_id FROM attendance WHERE date = ? AND status = 'A' AND notification_sent = 0");
        $absenteesStmt->execute([$date]);
        $absentees = $absenteesStmt->fetchAll();
        
        $emails = 0;
        $sms = 0;
        $calls = 0;
        
        $studentStmt = $pdo->prepare("SELECT * FROM students WHERE id = ?");
        $absencesStmt = $pdo->prepare("SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = 'A'");
        
        foreach ($absentees as $a) {
            $studentStmt->execute([$a['student_id']]);
            $student = $studentStmt->fetch();
            
            $absencesStmt->execute([$student['id']]);
            $totalAbsences = (int)$absencesStmt->fetch()['count'];
            
            if ($totalAbsences > 0) {
                $hasEmail = !empty(trim($student['email'])) && $student['email'] !== 'no-email@domain.com';
                $hasContact = !empty(trim($student['contact_number'])) && $student['contact_number'] !== '0000000000';
                
                if ($totalAbsences >= 6) {
                    if ($hasContact) $calls++;
                } else {
                    if ($hasEmail) $emails++;
                    if ($hasContact) $sms++;
                }
            }
        }
        
        echo json_encode(['emails' => $emails, 'sms' => $sms, 'calls' => $calls]);
    }

    public function send() {
        $data = $_POST;
        $date = isset($data['date']) ? $data['date'] : null;
        if (!$date) {
            http_response_code(400);
            echo json_encode(['error' => 'date required']);
            return;
        }
        
        $pdo = Database::getConnection();

        $twilioSid = trim($_ENV['TWILIO_ACCOUNT_SID'] ?? getenv('TWILIO_ACCOUNT_SID') ?: '');
        $twilioAuth = trim($_ENV['TWILIO_AUTH_TOKEN'] ?? getenv('TWILIO_AUTH_TOKEN') ?: '');
        $twilioPhone = trim($_ENV['TWILIO_PHONE_NUMBER'] ?? getenv('TWILIO_PHONE_NUMBER') ?: '');

        $mjKey = trim($_ENV['MAILJET_API_KEY'] ?? getenv('MAILJET_API_KEY') ?: '');
        $mjSecret = trim($_ENV['MAILJET_API_SECRET'] ?? getenv('MAILJET_API_SECRET') ?: '');
        $mjFromEmail = trim($_ENV['MAILJET_FROM_EMAIL'] ?? getenv('MAILJET_FROM_EMAIL') ?: '');

        $mockMode = (!$twilioSid || !$mjKey);

        $twilioClient = null;
        $mailjetClient = null;

        if (!$mockMode) {
            if ($twilioSid && $twilioAuth) {
                $twilioClient = new \Twilio\Rest\Client($twilioSid, $twilioAuth);
            }
            if ($mjKey && $mjSecret) {
                $mailjetClient = new \Mailjet\Client($mjKey, $mjSecret, true, ['version' => 'v3.1']);
            }
        }

        $absenteesStmt = $pdo->prepare("SELECT student_id FROM attendance WHERE date = ? AND status = 'A' AND notification_sent = 0");
        $absenteesStmt->execute([$date]);
        $absentees = $absenteesStmt->fetchAll();

        $updateStmt = $pdo->prepare("UPDATE attendance SET notification_sent = 1 WHERE student_id = ? AND date = ?");
        $studentStmt = $pdo->prepare("SELECT * FROM students WHERE id = ?");
        $absencesStmt = $pdo->prepare("SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = 'A'");

        $logs = [];

        foreach ($absentees as $a) {
            $studentStmt->execute([$a['student_id']]);
            $student = $studentStmt->fetch();
            
            $absencesStmt->execute([$student['id']]);
            $totalAbsences = (int)$absencesStmt->fetch()['count'];
            
            $hasEmail = !empty(trim($student['email'])) && $student['email'] !== 'no-email@domain.com';
            $hasContact = !empty(trim($student['contact_number'])) && $student['contact_number'] !== '0000000000';

            if ($totalAbsences >= 6) {
                if ($hasContact) {
                    if ($twilioClient && $twilioPhone && !$mockMode) {
                        $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
                        $baseUrl = $protocol . $_SERVER['HTTP_HOST'];
                        try {
                            $twilioClient->calls->create(
                                $student['contact_number'], 
                                $twilioPhone, 
                                [
                                    "twiml" => "<Response><Gather input=\"speech\" action=\"{$baseUrl}/api/notifications/twilio-voice-callback\" timeout=\"5\"><Say>Alert from Attend A I. {$student['name']} has been marked absent. This is their {$totalAbsences}th absence. Please state the reason for this absence after the beep.</Say></Gather><Say>We didn't receive any input. Goodbye.</Say></Response>"
                                ]
                            );
                            $logs[] = ['studentName' => $student['name'], 'action' => 'Voice Call', 'status' => 'Success', 'reason' => 'Call initiated successfully'];
                        } catch (\Exception $e) {
                            $logs[] = ['studentName' => $student['name'], 'action' => 'Voice Call', 'status' => 'Error', 'reason' => $e->getMessage()];
                        }
                    } else {
                        $logs[] = ['studentName' => $student['name'], 'action' => 'Voice Call', 'status' => 'Success', 'reason' => 'Mock call logged (No API Keys)'];
                    }
                }
            } else {
                if ($hasContact) {
                    if ($twilioClient && $twilioPhone && !$mockMode) {
                        try {
                            $twilioClient->messages->create(
                                $student['contact_number'],
                                [
                                    'from' => $twilioPhone,
                                    'body' => "ATTENDANCE ALERT: {$student['name']} has been marked ABSENT today ({$date}). Total absences: {$totalAbsences}. Please contact the school to provide a reason."
                                ]
                            );
                            $logs[] = ['studentName' => $student['name'], 'action' => 'SMS', 'status' => 'Success', 'reason' => 'Message sent successfully'];
                        } catch (\Exception $e) {
                            $logs[] = ['studentName' => $student['name'], 'action' => 'SMS', 'status' => 'Error', 'reason' => $e->getMessage()];
                        }
                    } else {
                        $logs[] = ['studentName' => $student['name'], 'action' => 'SMS', 'status' => 'Success', 'reason' => 'Mock SMS logged (No API Keys)'];
                    }
                }
                
                if ($hasEmail) {
                    if ($mailjetClient && $mjFromEmail && !$mockMode) {
                        try {
                            $body = [
                                'Messages' => [
                                    [
                                        'From' => [ 'Email' => $mjFromEmail, 'Name' => 'AttendAI' ],
                                        'To' => [ [ 'Email' => $student['email'], 'Name' => $student['name'] ] ],
                                        'Subject' => "Absence Notification",
                                        'TextPart' => "Dear Parent/Guardian,\n\nThis is an official notification from AttendAI.\n\nStudent Name: {$student['name']}\nDate of Absence: {$date}\nTotal Absences Recorded: {$totalAbsences}\n\nPlease contact the school administration as soon as possible to provide a valid reason for this absence. Consistent attendance is crucial for academic success.\n\nRegards,\nAttendAI Automated System"
                                    ]
                                ]
                            ];
                            $response = $mailjetClient->post(\Mailjet\Resources::$Email, ['body' => $body]);
                            if ($response->success()) {
                                $logs[] = ['studentName' => $student['name'], 'action' => 'Email', 'status' => 'Success', 'reason' => 'Email sent successfully'];
                            } else {
                                $logs[] = ['studentName' => $student['name'], 'action' => 'Email', 'status' => 'Error', 'reason' => 'Mailjet Error: ' . json_encode($response->getData())];
                            }
                        } catch (\Exception $e) {
                            $logs[] = ['studentName' => $student['name'], 'action' => 'Email', 'status' => 'Error', 'reason' => $e->getMessage()];
                        }
                    } else {
                        $logs[] = ['studentName' => $student['name'], 'action' => 'Email', 'status' => 'Success', 'reason' => 'Mock Email logged (No API Keys)'];
                    }
                }
            }
            
            // Mark as sent
            $updateStmt->execute([$student['id'], $date]);
        }
        
        if (count($logs) === 0) {
            $logs[] = ['studentName' => 'N/A', 'action' => 'None', 'status' => 'Info', 'reason' => 'No new absentees to notify today.'];
        }

        echo json_encode([
            'success' => true, 
            'message' => 'Notifications processed',
            'logs' => $logs
        ]);
    }

    public function pending() {
        $date = isset($_GET['date']) ? $_GET['date'] : null;
        if (!$date) {
            http_response_code(400);
            echo json_encode(['error' => 'date required']);
            return;
        }
        
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT student_id FROM attendance WHERE date = ? AND status = 'A' AND notification_sent = 0");
        $stmt->execute([$date]);
        $absentees = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        
        echo json_encode(['pending' => array_column($absentees, 'student_id')]);
    }

    public function sendSingle() {
        $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
        $date = isset($data['date']) ? $data['date'] : null;
        $studentId = isset($data['student_id']) ? $data['student_id'] : null;
        
        if (!$date || !$studentId) {
            http_response_code(400);
            echo json_encode(['error' => 'date and student_id required']);
            return;
        }
        
        $pdo = Database::getConnection();

        $twilioSid = trim($_ENV['TWILIO_ACCOUNT_SID'] ?? getenv('TWILIO_ACCOUNT_SID') ?: '');
        $twilioAuth = trim($_ENV['TWILIO_AUTH_TOKEN'] ?? getenv('TWILIO_AUTH_TOKEN') ?: '');
        $twilioPhone = trim($_ENV['TWILIO_PHONE_NUMBER'] ?? getenv('TWILIO_PHONE_NUMBER') ?: '');

        $mjKey = trim($_ENV['MAILJET_API_KEY'] ?? getenv('MAILJET_API_KEY') ?: '');
        $mjSecret = trim($_ENV['MAILJET_API_SECRET'] ?? getenv('MAILJET_API_SECRET') ?: '');
        $mjFromEmail = trim($_ENV['MAILJET_FROM_EMAIL'] ?? getenv('MAILJET_FROM_EMAIL') ?: '');

        $mockMode = (!$twilioSid || !$mjKey);

        $twilioClient = null;
        $mailjetClient = null;

        if (!$mockMode) {
            if ($twilioSid && $twilioAuth) {
                $twilioClient = new \Twilio\Rest\Client($twilioSid, $twilioAuth);
            }
            if ($mjKey && $mjSecret) {
                $mailjetClient = new \Mailjet\Client($mjKey, $mjSecret, true, ['version' => 'v3.1']);
            }
        }

        $studentStmt = $pdo->prepare("SELECT * FROM students WHERE id = ?");
        $studentStmt->execute([$studentId]);
        $student = $studentStmt->fetch();
        
        if (!$student) {
             echo json_encode(['success' => false, 'logs' => []]);
             return;
        }

        $absencesStmt = $pdo->prepare("SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = 'A'");
        $absencesStmt->execute([$studentId]);
        $totalAbsences = (int)$absencesStmt->fetch()['count'];
        
        $logs = [];
        $hasEmail = !empty(trim($student['email'])) && $student['email'] !== 'no-email@domain.com';
        $hasContact = !empty(trim($student['contact_number'])) && $student['contact_number'] !== '0000000000';

        if ($totalAbsences >= 6) {
            if ($hasContact) {
                if ($twilioClient && $twilioPhone && !$mockMode) {
                    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || $_SERVER['SERVER_PORT'] == 443) ? "https://" : "http://";
                    $baseUrl = $protocol . $_SERVER['HTTP_HOST'];
                    try {
                        $twilioClient->calls->create(
                            $student['contact_number'], 
                            $twilioPhone, 
                            [
                                "twiml" => "<Response><Gather input=\"speech\" action=\"{$baseUrl}/api/notifications/twilio-voice-callback\" timeout=\"5\"><Say>Alert from Attend A I. {$student['name']} has been marked absent. This is their {$totalAbsences}th absence. Please state the reason for this absence after the beep.</Say></Gather><Say>We didn't receive any input. Goodbye.</Say></Response>"
                            ]
                        );
                        $logs[] = ['studentName' => $student['name'], 'action' => 'Voice Call', 'status' => 'Success', 'reason' => 'Call initiated successfully'];
                    } catch (\Exception $e) {
                        $logs[] = ['studentName' => $student['name'], 'action' => 'Voice Call', 'status' => 'Error', 'reason' => $e->getMessage()];
                    }
                } else {
                    $logs[] = ['studentName' => $student['name'], 'action' => 'Voice Call', 'status' => 'Success', 'reason' => 'Mock call logged (No API Keys)'];
                }
            }
        } else {
            if ($hasContact) {
                if ($twilioClient && $twilioPhone && !$mockMode) {
                    try {
                        $twilioClient->messages->create(
                            $student['contact_number'],
                            [
                                'from' => $twilioPhone,
                                'body' => "ATTENDANCE ALERT: {$student['name']} has been marked ABSENT today ({$date}). Total absences: {$totalAbsences}. Please contact the school to provide a reason."
                            ]
                        );
                        $logs[] = ['studentName' => $student['name'], 'action' => 'SMS', 'status' => 'Success', 'reason' => 'Message sent successfully'];
                    } catch (\Exception $e) {
                        $logs[] = ['studentName' => $student['name'], 'action' => 'SMS', 'status' => 'Error', 'reason' => $e->getMessage()];
                    }
                } else {
                    $logs[] = ['studentName' => $student['name'], 'action' => 'SMS', 'status' => 'Success', 'reason' => 'Mock SMS logged (No API Keys)'];
                }
            }
            
            if ($hasEmail) {
                if ($mailjetClient && $mjFromEmail && !$mockMode) {
                    try {
                        $body = [
                            'Messages' => [
                                [
                                    'From' => [ 'Email' => $mjFromEmail, 'Name' => 'AttendAI' ],
                                    'To' => [ [ 'Email' => $student['email'], 'Name' => $student['name'] ] ],
                                    'Subject' => "Absence Notification",
                                    'TextPart' => "Dear Parent/Guardian,\n\nThis is an official notification from AttendAI.\n\nStudent Name: {$student['name']}\nDate of Absence: {$date}\nTotal Absences Recorded: {$totalAbsences}\n\nPlease contact the school administration as soon as possible to provide a valid reason for this absence. Consistent attendance is crucial for academic success.\n\nRegards,\nAttendAI Automated System"
                                ]
                            ]
                        ];
                        $response = $mailjetClient->post(\Mailjet\Resources::$Email, ['body' => $body]);
                        if ($response->success()) {
                            $logs[] = ['studentName' => $student['name'], 'action' => 'Email', 'status' => 'Success', 'reason' => 'Email sent successfully'];
                        } else {
                            $logs[] = ['studentName' => $student['name'], 'action' => 'Email', 'status' => 'Error', 'reason' => 'Mailjet Error: ' . json_encode($response->getData())];
                        }
                    } catch (\Exception $e) {
                        $logs[] = ['studentName' => $student['name'], 'action' => 'Email', 'status' => 'Error', 'reason' => $e->getMessage()];
                    }
                } else {
                    $logs[] = ['studentName' => $student['name'], 'action' => 'Email', 'status' => 'Success', 'reason' => 'Mock Email logged (No API Keys)'];
                }
            }
        }
        
        $updateStmt = $pdo->prepare("UPDATE attendance SET notification_sent = 1 WHERE student_id = ? AND date = ?");
        $updateStmt->execute([$studentId, $date]);

        $insertLogStmt = $pdo->prepare("INSERT INTO notification_logs (student_id, date, action, status, reason) VALUES (?, ?, ?, ?, ?)");
        foreach ($logs as $log) {
            $insertLogStmt->execute([$studentId, $date, $log['action'], $log['status'], $log['reason']]);
        }

        // Auto-cleanup: Keep only the latest 350 records
        $pdo->exec("DELETE FROM notification_logs WHERE id NOT IN (SELECT id FROM notification_logs ORDER BY created_at DESC LIMIT 350)");

        echo json_encode([
            'success' => true, 
            'logs' => $logs
        ]);
    }

    public function history() {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("
            SELECT nl.*, s.name as studentName, a.reason as parentReason 
            FROM notification_logs nl 
            JOIN students s ON nl.student_id = s.id 
            LEFT JOIN attendance a ON nl.student_id = a.student_id AND nl.date = a.date
            ORDER BY nl.created_at DESC 
            LIMIT 350
        ");
        $logs = $stmt->fetchAll(\PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'logs' => $logs]);
    }

    public function twilioVoiceCallback() {
        $parentResponse = isset($_POST['SpeechResult']) ? $_POST['SpeechResult'] : null;
        $incomingCallTo = isset($_POST['To']) ? $_POST['To'] : null;
        
        $response = new VoiceResponse();
        
        if ($parentResponse) {
            $response->say('Thank you for providing the reason. Your response has been logged by Attend AI. Goodbye.');
            
            try {
                $pdo = Database::getConnection();
                $studentStmt = $pdo->prepare("SELECT id FROM students WHERE contact_number = ?");
                $studentStmt->execute([$incomingCallTo]);
                $student = $studentStmt->fetch();
                
                if ($student) {
                    $recentStmt = $pdo->prepare("SELECT date FROM attendance WHERE student_id = ? AND status = 'A' ORDER BY date DESC LIMIT 1");
                    $recentStmt->execute([$student['id']]);
                    $recentAbsence = $recentStmt->fetch();
                    
                    if ($recentAbsence) {
                        $updateStmt = $pdo->prepare("UPDATE attendance SET reason = ? WHERE student_id = ? AND date = ?");
                        $updateStmt->execute([$parentResponse, $student['id'], $recentAbsence['date']]);
                    }
                }
            } catch (\Exception $err) {
                error_log('Database log update failed during webhook: ' . $err->getMessage());
            }
        } else {
            $response->say('No voice response detected. Attend AI will notify the teacher. Goodbye.');
        }
        
        header('Content-Type: text/xml');
        echo $response;
        exit;
    }
}
