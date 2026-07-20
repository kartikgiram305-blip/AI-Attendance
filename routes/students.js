const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

router.get('/', (req, res) => {
  const { classId, page = 1, limit = 50 } = req.query;
  if (!classId) return res.status(400).json({ error: 'classId is required' });
  const offset = (page - 1) * limit;
  const students = db.prepare("SELECT * FROM students WHERE class_id = ? ORDER BY name ASC LIMIT ? OFFSET ?").all(classId, limit, offset);
  const total = db.prepare("SELECT COUNT(*) as count FROM students WHERE class_id = ?").get(classId).count;
  res.json({ data: students, total, page: parseInt(page), limit: parseInt(limit) });
});

router.post('/', (req, res) => {
  const { classId, name, email, contact } = req.body;
  if (!classId || !name || !email || !contact) return res.status(400).json({ error: 'classId, name, email, and contact are required' });
  const result = db.prepare("INSERT INTO students (class_id, name, email, contact_number) VALUES (?, ?, ?, ?)").run(classId, name, email, contact);
  res.json({ id: result.lastInsertRowid, class_id: classId, name, email, contact_number: contact });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, contact } = req.body;
  if (!name || !email || !contact) return res.status(400).json({ error: 'name, email, and contact are required' });
  db.prepare("UPDATE students SET name = ?, email = ?, contact_number = ? WHERE id = ?").run(name, email, contact, id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare("DELETE FROM students WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

router.post('/import', upload.single('file'), (req, res) => {
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
        const email = emailIdx !== -1 ? (row[emailIdx] || 'no-email@domain.com') : 'no-email@domain.com';
        const contact = contactIdx !== -1 ? (row[contactIdx] || '0000000000') : '0000000000';
        stmt.run(classId, row[nameIdx], email, contact);
      }
    }
  });
  
  insertMany(data);
  fs.unlink(req.file.path, () => {});
  res.json({ success: true });
});

module.exports = router;
