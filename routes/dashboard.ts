const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/stats', (req, res) => {
  const totalClasses = db.prepare("SELECT COUNT(*) as count FROM classes").get().count;
  const totalStudents = db.prepare("SELECT COUNT(*) as count FROM students").get().count;
  
  const today = new Date().toISOString().split('T')[0];
  
  const todayPresent = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = 'P'").get(today).count;
  const todayTotal = db.prepare("SELECT COUNT(*) as count FROM attendance WHERE date = ? AND (status = 'P' OR status = 'A')").get(today).count;
  const todayRate = todayTotal > 0 ? ((todayPresent / todayTotal) * 100).toFixed(1) : 0;
  
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
});

module.exports = router;
