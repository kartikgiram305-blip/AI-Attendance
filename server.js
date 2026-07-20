require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const xlsx = require('xlsx');
const Database = require('better-sqlite3');
const { Worker } = require('worker_threads');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Set up SQLite database
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  );

  CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER,
    name TEXT,
    email TEXT,
    contact_number TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(class_id) REFERENCES classes(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    date TEXT,
    status TEXT,
    notification_sent INTEGER DEFAULT 0,
    FOREIGN KEY(student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(student_id, date)
  );
`);

// Insert default user if not exists
const userStmt = db.prepare("SELECT * FROM users WHERE username = 'user1'");
if (!userStmt.get()) {
  db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run('user1', 'user1');
}

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (token === 'Bearer user1_token') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.put('/api/classes/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    db.prepare("UPDATE classes SET name = ? WHERE id = ?").run(name, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/students/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, contact } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    db.prepare("UPDATE students SET name = ?, email = ?, contact_number = ? WHERE id = ?").run(name, email, contact, id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login API
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
  if (user) {
    res.json({ token: 'user1_token', username: user.username });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Protect all API routes after login
app.use('/api', authMiddleware); 

// --- Dashboard Stats ---
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const totalClasses = db.prepare("SELECT COUNT(*) as count FROM classes").get().count;
    const totalStudents = db.prepare("SELECT COUNT(*) as count FROM students").get().count;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Today's stats
    const todayPresent = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = 'P'").get(today).count;
    const todayTotal = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE date = ? AND (status = 'P' OR status = 'A')").get(today).count;
    const todayRate = todayTotal > 0 ? ((todayPresent / todayTotal) * 100).toFixed(1) : 0;
    
    // 30 day trend
    const trendRecords = db.prepare(`
      SELECT date, 
             SUM(CASE WHEN status = 'P' THEN 1 ELSE 0 END) as present,
             COUNT(*) as total
      FROM attendance 
      WHERE date >= date('now', '-30 days') AND (status = 'P' OR status = 'A')
      GROUP BY date
      ORDER BY date ASC
    `).all();
    
    const trend = trendRecords.map(r => ({
      date: r.date,
      rate: r.total > 0 ? ((r.present / r.total) * 100).toFixed(1) : 0
    }));

    res.json({
      totalClasses,
      totalStudents,
      todayRate,
      trend
    });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Classes CRUD ---
app.get('/api/classes', (req, res) => {
  const classes = db.prepare("SELECT * FROM classes ORDER BY created_at DESC").all();
  classes.forEach(c => {
    const count = db.prepare("SELECT COUNT(*) as count FROM students WHERE class_id = ?").get(c.id);
    c.studentCount = count.count;
  });
  res.json(classes);
});

app.post('/api/classes', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare("INSERT INTO classes (name) VALUES (?)").run(name);
  res.json({ id: result.lastInsertRowid, name });
});

app.delete('/api/classes/:id', (req, res) => {
  db.prepare("DELETE FROM classes WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// --- Students CRUD ---
app.get('/api/students', (req, res) => {
  const { classId } = req.query;
  if (!classId) return res.status(400).json({ error: 'classId is required' });
  const students = db.prepare("SELECT * FROM students WHERE class_id = ? ORDER BY name ASC").all(classId);
  res.json(students);
});

app.post('/api/students', (req, res) => {
  const { classId, name, email, contact } = req.body;
  if (!classId || !name) return res.status(400).json({ error: 'classId and name required' });
  const result = db.prepare("INSERT INTO students (class_id, name, email, contact_number) VALUES (?, ?, ?, ?)").run(classId, name, email, contact || '');
  res.json({ id: result.lastInsertRowid, class_id: classId, name, email, contact_number: contact });
});

app.delete('/api/students/:id', (req, res) => {
  db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// --- Attendance ---
app.get('/api/attendance', (req, res) => {
  const { classId, month } = req.query; // month format: 'YYYY-MM'
  if (!classId || !month) return res.status(400).json({ error: 'classId and month required' });
  
  const students = db.prepare("SELECT * FROM students WHERE class_id = ? ORDER BY name ASC").all(classId);
  
  const attendance = db.prepare(`
    SELECT a.* FROM attendance a
    JOIN students s ON a.student_id = s.id
    WHERE s.class_id = ? AND a.date LIKE ?
  `).all(classId, `${month}-%`);

  const attMap = {};
  students.forEach(s => { attMap[s.id] = {}; });
  
  attendance.forEach(a => { 
    if (attMap[a.student_id]) {
      attMap[a.student_id][a.date] = a.status; 
    }
  });

  const result = students.map(s => ({
    student_id: s.id,
    name: s.name,
    email: s.email,
    contact: s.contact_number,
    attendance: attMap[s.id]
  }));

  res.json(result);
});

app.post('/api/attendance', (req, res) => {
  const { classId, date, records } = req.body;
  const stmt = db.prepare(`
    INSERT INTO attendance (student_id, date, status) 
    VALUES (?, ?, ?)
    ON CONFLICT(student_id, date) DO UPDATE SET status=excluded.status
  `);
  
  const insertMany = db.transaction((records) => {
    for (const r of records) {
      if (r.status === 'P' || r.status === 'A') {
        stmt.run(r.student_id, date, r.status);
      } else if (r.status === null) {
        db.prepare("DELETE FROM attendance WHERE student_id = ? AND date = ?").run(r.student_id, date);
      }
    }
  });

  insertMany(records);
  res.json({ success: true });
});

// --- Notifications ---
app.get('/api/notifications/preview', (req, res) => {
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
      const hasEmail = student.email && student.email.trim() !== '';
      const hasContact = student.contact_number && student.contact_number.trim() !== '';
      
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

app.post('/api/notifications/send', (req, res) => {
  const { date } = req.body;
  
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioApiKey = process.env.TWILIO_API_KEY;
  const twilioApiSecret = process.env.TWILIO_API_SECRET;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const mjKey = process.env.MAILJET_API_KEY;
  const mjSecret = process.env.MAILJET_API_SECRET;
  const mjFromEmail = process.env.MAILJET_FROM_EMAIL;

  const jobData = {
    date,
    twilioSid, twilioToken, twilioApiKey, twilioApiSecret, twilioPhone, mjKey, mjSecret, mjFromEmail
  };

  const worker = new Worker(path.join(__dirname, 'worker.js'), {
    workerData: { jobData }
  });
  
  worker.on('message', (msg) => {
     if(msg.type === 'done') {
        const absentees = db.prepare("SELECT student_id FROM attendance WHERE date = ? AND status = 'A'").all(date);
        const updateStmt = db.prepare("UPDATE attendance SET notification_sent = 1 WHERE student_id = ? AND date = ?");
        const markSent = db.transaction((abs) => {
            for(let a of abs) {
                updateStmt.run(a.student_id, date);
            }
        });
        markSent(absentees);
     }
  });
  
  res.json({ success: true, message: 'Processing in background' });
});

// Bulk Import
const upload = multer({ dest: 'uploads/' });
app.post('/api/students/import', upload.single('file'), (req, res) => {
  const classId = req.body.classId;
  if (!classId || !req.file) return res.status(400).json({ error: 'Class ID and file are required' });
  
  const workbook = xlsx.readFile(req.file.path);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
  
  if (data.length < 2) return res.status(400).json({ error: 'File empty' });
  const headers = data[0].map(h => h ? h.toString().toLowerCase() : '');
  const nameIdx = headers.findIndex(h => h.includes('name'));
  const emailIdx = headers.findIndex(h => h.includes('email'));
  const contactIdx = headers.findIndex(h => h.includes('contact'));
  
  if (nameIdx === -1) return res.status(400).json({ error: 'Name column not found' });
  
  const stmt = db.prepare("INSERT INTO students (class_id, name, email, contact_number) VALUES (?, ?, ?, ?)");
  
  const insertMany = db.transaction((rows) => {
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row && row[nameIdx]) {
        stmt.run(classId, row[nameIdx], emailIdx !== -1 ? (row[emailIdx] || '') : '', contactIdx !== -1 ? (row[contactIdx] || '') : '');
      }
    }
  });
  
  insertMany(data);
  fs.unlink(req.file.path, () => {});
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
