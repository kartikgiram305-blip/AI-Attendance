const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', (req, res) => {
  const classes = db.prepare("SELECT * FROM classes ORDER BY created_at DESC").all();
  classes.forEach(c => {
    const count = db.prepare("SELECT COUNT(*) as count FROM students WHERE class_id = ?").get(c.id);
    c.studentCount = count.count;
  });
  res.json(classes);
});

router.post('/', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const result = db.prepare("INSERT INTO classes (name) VALUES (?)").run(name);
  res.json({ id: result.lastInsertRowid, name });
});

router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  db.prepare("UPDATE classes SET name = ? WHERE id = ?").run(name, id);
  res.json({ success: true });
});

router.delete('/:id', (req, res) => {
  db.prepare("DELETE FROM classes WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

module.exports = router;
