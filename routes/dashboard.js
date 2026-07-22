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

  const todayStats = db.prepare(`
    SELECT 
      SUM(CASE WHEN status = 'P' THEN 1 ELSE 0 END) as present,
      SUM(CASE WHEN status = 'A' THEN 1 ELSE 0 END) as absent
    FROM attendance
    WHERE date = ?
  `).get(today);

  const classStats = db.prepare(`
    SELECT c.name, 
           SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END) as present,
           SUM(CASE WHEN a.status = 'A' THEN 1 ELSE 0 END) as absent
    FROM classes c
    LEFT JOIN students s ON c.id = s.class_id
    LEFT JOIN attendance a ON s.id = a.student_id AND a.date LIKE ?
    GROUP BY c.id
  `).all(`${today.substring(0, 7)}%`);
  
  const classAttendance = classStats.map(c => {
    const total = (c.present || 0) + (c.absent || 0);
    return {
      name: c.name,
      rate: total > 0 ? ((c.present / total) * 100).toFixed(1) : 0
    };
  });

  res.json({
    totalClasses,
    totalStudents,
    todayRate,
    trend,
    todayStats: {
      present: todayStats.present || 0,
      absent: todayStats.absent || 0
    },
    classAttendance
  });
});

module.exports = router;
