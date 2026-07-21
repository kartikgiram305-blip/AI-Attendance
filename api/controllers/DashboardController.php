<?php
namespace App\Controllers;

use App\Config\Database;

class DashboardController {
    public function stats() {
        $pdo = Database::getConnection();
        
        $totalClasses = (int)$pdo->query("SELECT COUNT(*) as count FROM classes")->fetch()['count'];
        $totalStudents = (int)$pdo->query("SELECT COUNT(*) as count FROM students")->fetch()['count'];
        
        $today = date('Y-m-d');
        
        $todayPresentStmt = $pdo->prepare("SELECT COUNT(*) as count FROM attendance WHERE date = ? AND status = 'P'");
        $todayPresentStmt->execute([$today]);
        $todayPresent = (int)$todayPresentStmt->fetch()['count'];
        
        $todayTotalStmt = $pdo->prepare("SELECT COUNT(*) as count FROM attendance WHERE date = ? AND (status = 'P' OR status = 'A')");
        $todayTotalStmt->execute([$today]);
        $todayTotal = (int)$todayTotalStmt->fetch()['count'];
        
        $todayRate = $todayTotal > 0 ? number_format(($todayPresent / $todayTotal) * 100, 1) : "0";
        
        $trendRecords = $pdo->query("
            SELECT date, 
                   SUM(CASE WHEN status = 'P' THEN 1 ELSE 0 END) as present,
                   COUNT(*) as total
            FROM attendance 
            WHERE date >= date('now', '-30 days') AND (status = 'P' OR status = 'A')
            GROUP BY date
            ORDER BY date ASC
        ")->fetchAll();
        
        $trend = array_map(function($r) {
            return [
                'date' => $r['date'],
                'rate' => $r['total'] > 0 ? number_format(($r['present'] / $r['total']) * 100, 1) : "0"
            ];
        }, $trendRecords);

        $todayStatsStmt = $pdo->prepare("
            SELECT 
              SUM(CASE WHEN status = 'P' THEN 1 ELSE 0 END) as present,
              SUM(CASE WHEN status = 'A' THEN 1 ELSE 0 END) as absent
            FROM attendance
            WHERE date = ?
        ");
        $todayStatsStmt->execute([$today]);
        $todayStats = $todayStatsStmt->fetch();

        $classStatsStmt = $pdo->prepare("
            SELECT c.name, 
                   SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END) as present,
                   SUM(CASE WHEN a.status = 'A' THEN 1 ELSE 0 END) as absent
            FROM classes c
            LEFT JOIN students s ON c.id = s.class_id
            LEFT JOIN attendance a ON s.id = a.student_id AND a.date LIKE ?
            GROUP BY c.id
        ");
        $classStatsStmt->execute([substr($today, 0, 7) . "%"]);
        $classStats = $classStatsStmt->fetchAll();
        
        $classAttendance = array_map(function($c) {
            $total = (int)$c['present'] + (int)$c['absent'];
            return [
                'name' => $c['name'],
                'rate' => $total > 0 ? number_format(($c['present'] / $total) * 100, 1) : "0"
            ];
        }, $classStats);

        echo json_encode([
            'totalClasses' => $totalClasses,
            'totalStudents' => $totalStudents,
            'todayRate' => $todayRate,
            'trend' => $trend,
            'todayStats' => [
                'present' => (int)$todayStats['present'] ?: 0,
                'absent' => (int)$todayStats['absent'] ?: 0
            ],
            'classAttendance' => $classAttendance
        ]);
    }
}
