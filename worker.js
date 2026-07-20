const { parentPort, workerData } = require('worker_threads');
const twilio = require('twilio');
const Mailjet = require('node-mailjet');
const Database = require('better-sqlite3');
const path = require('path');

async function processJob() {
  const { jobData } = workerData;
  const { date, twilioSid, twilioToken, twilioApiKey, twilioApiSecret, twilioPhone, mjKey, mjSecret, mjFromEmail } = jobData;

  const dbPath = path.join(__dirname, 'database.sqlite');
  const db = new Database(dbPath);

  let twilioClient;
  let mailjetClient;
  
  const mockMode = (!twilioSid || !mjKey);
  
  if (!mockMode) {
    if (twilioApiKey && twilioApiSecret) {
      twilioClient = twilio(twilioApiKey, twilioApiSecret, { accountSid: twilioSid });
    } else {
      twilioClient = twilio(twilioSid, twilioToken);
    }
    mailjetClient = new Mailjet({ apiKey: mjKey, apiSecret: mjSecret });
  }

  const absentees = db.prepare("SELECT student_id FROM attendance WHERE date = ? AND status = 'A' AND notification_sent = 0").all(date);
  
  let emailsSent = 0;
  let smsSent = 0;
  let callsMade = 0;
  
  for (const a of absentees) {
    const student = db.prepare("SELECT * FROM students WHERE id = ?").get(a.student_id);
    const totalAbsences = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE student_id = ? AND status = 'A'").get(student.id).count;
    
    if (totalAbsences > 0) {
      const contactIsValid = student.contact_number && student.contact_number.length > 5;
      const emailIsValid = student.email && student.email.includes('@');
      
      if (totalAbsences >= 6) {
        if (contactIsValid) {
          callsMade++;
          if (!mockMode) {
             try {
               await twilioClient.calls.create({
                 twiml: `<Response><Say>Hello, this is Zeal College. ${student.name} has been absent for ${totalAbsences} days.</Say></Response>`,
                 to: student.contact_number,
                 from: twilioPhone
               });
             } catch(e) { console.error('Call failed', e); }
          }
        }
      } else {
        if (contactIsValid) {
          smsSent++;
          if (!mockMode) {
            try {
              await twilioClient.messages.create({
                body: `Hello from Zeal College. ${student.name} has been absent for ${totalAbsences} days.`,
                from: twilioPhone,
                to: student.contact_number
              });
            } catch(e){ console.error('SMS failed', e); }
          }
        }
        if (emailIsValid) {
          emailsSent++;
          if (!mockMode) {
             try {
                await mailjetClient.post("send", { 'version': 'v3.1' }).request({
                  "Messages": [{
                    "From": { "Email": mjFromEmail, "Name": "Zeal College" },
                    "To": [ { "Email": student.email, "Name": student.name } ],
                    "Subject": `Attendance Warning: ${student.name}`,
                    "TextPart": `This is an automated notification. ${student.name} has been absent for ${totalAbsences} days.`
                  }]
                });
             } catch(e) { console.error('Email failed', e); }
          }
        }
      }
    }
  }

  parentPort.postMessage({ type: 'done', result: { emailsSent, smsSent, callsMade } });
}

processJob().catch(err => {
  parentPort.postMessage({ type: 'error', error: err.message });
});
