const express = require('express');
const router = express.Router();
const db = require('../db');
const { createObjectCsvStringifier } = require('csv-writer');

router.get('/', (req, res) => {
  const { classId, month } = req.query;
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

router.post('/', (req, res) => {
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

router.get('/export', (req, res) => {
  const { classId, month } = req.query;
  if (!classId || !month) return res.status(400).json({ error: 'classId and month required' });

  const cls = db.prepare("SELECT name FROM classes WHERE id = ?").get(classId);
  if (!cls) return res.status(404).json({ error: 'Class not found' });

  const students = db.prepare("SELECT * FROM students WHERE class_id = ? ORDER BY name ASC").all(classId);
  const attendance = db.prepare(`
    SELECT a.* FROM attendance a
    JOIN students s ON a.student_id = s.id
    WHERE s.class_id = ? AND a.date LIKE ?
  `).all(classId, `${month}-%`);

  const [year, monthStr] = month.split('-');
  const daysInMonth = new Date(parseInt(year), parseInt(monthStr), 0).getDate();
  
  const headers = [
    { id: 'name', title: 'Student Name' },
    { id: 'email', title: 'Email' },
    { id: 'contact', title: 'Contact' },
    { id: 'totalP', title: 'Total Present' },
    { id: 'totalA', title: 'Total Absent' },
    { id: 'rate', title: 'Attendance %' }
  ];

  for (let i = 1; i <= daysInMonth; i++) {
    const dStr = `${year}-${monthStr}-${i.toString().padStart(2, '0')}`;
    headers.push({ id: dStr, title: `${i}` });
  }

  const csvStringifier = createObjectCsvStringifier({ header: headers });
  
  const attMap = {};
  students.forEach(s => { attMap[s.id] = {}; });
  attendance.forEach(a => { if (attMap[a.student_id]) attMap[a.student_id][a.date] = a.status; });

  const records = students.map(s => {
    let totalP = 0, totalA = 0;
    const rec = { name: s.name, email: s.email, contact: s.contact_number };
    
    for (let i = 1; i <= daysInMonth; i++) {
      const dStr = `${year}-${monthStr}-${i.toString().padStart(2, '0')}`;
      const status = attMap[s.id][dStr] || '-';
      rec[dStr] = status;
      if (status === 'P') totalP++;
      if (status === 'A') totalA++;
    }
    
    rec.totalP = totalP;
    rec.totalA = totalA;
    const total = totalP + totalA;
    rec.rate = total > 0 ? ((totalP / total) * 100).toFixed(1) + '%' : '0.0%';
    
    return rec;
  });

  const headerString = csvStringifier.getHeaderString();
  const recordsString = csvStringifier.stringifyRecords(records);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${cls.name.replace(/\\s+/g, '_')}_Attendance_${month}.csv"`);
  res.send(headerString + recordsString);
});

module.exports = router;
