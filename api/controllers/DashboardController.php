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
                   SUM(CASE WHEN status = 'A' THEN 1 ELSE 0 END) as absent,
                   COUNT(*) as total
            FROM attendance 
            WHERE date >= date('now', '-30 days') AND (status = 'P' OR status = 'A')
            GROUP BY date
            ORDER BY date ASC
        ")->fetchAll();
        
        $trend = array_map(function($r) {
            return [
                'date' => $r['date'],
                'rate' => $r['total'] > 0 ? number_format(($r['present'] / $r['total']) * 100, 1) : "0",
                'present' => (int)$r['present'],
                'absent' => (int)$r['absent']
            ];
        }, $trendRecords);

        // 1. Heatmap Data (90 days)
        $heatmapRecords = $pdo->query("
            SELECT date, 
                   SUM(CASE WHEN status = 'P' THEN 1 ELSE 0 END) as present,
                   COUNT(*) as total
            FROM attendance 
            WHERE date >= date('now', '-90 days') AND (status = 'P' OR status = 'A')
            GROUP BY date
            ORDER BY date ASC
        ")->fetchAll();
        $heatmap = array_map(function($r) {
            return [
                'date' => $r['date'],
                'rate' => $r['total'] > 0 ? number_format(($r['present'] / $r['total']) * 100, 1) : "0"
            ];
        }, $heatmapRecords);

        // 2. At-Risk Students (Bottom 5 < 80%)
        $atRiskRecords = $pdo->query("
            SELECT s.name, c.name as class_name,
                   SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END) as present,
                   COUNT(a.id) as total
            FROM students s
            JOIN classes c ON s.class_id = c.id
            JOIN attendance a ON s.id = a.student_id
            WHERE a.date >= date('now', '-30 days') AND (a.status = 'P' OR a.status = 'A')
            GROUP BY s.id
            HAVING total >= 5
            ORDER BY (present * 1.0 / total) ASC
            LIMIT 5
        ")->fetchAll();
        $atRisk = array_map(function($r) {
            return [
                'name' => $r['name'],
                'className' => $r['class_name'],
                'rate' => $r['total'] > 0 ? number_format(($r['present'] / $r['total']) * 100, 1) : "0"
            ];
        }, $atRiskRecords);

        // 3. Day of Week Attendance
        $dayOfWeekRecords = $pdo->query("
            SELECT strftime('%w', date) as dow,
                   SUM(CASE WHEN status = 'P' THEN 1 ELSE 0 END) as present,
                   COUNT(*) as total
            FROM attendance 
            WHERE date >= date('now', '-90 days') AND (status = 'P' OR status = 'A')
            GROUP BY dow
            ORDER BY dow ASC
        ")->fetchAll();
        $dowMap = ['0' => 'Sunday', '1' => 'Monday', '2' => 'Tuesday', '3' => 'Wednesday', '4' => 'Thursday', '5' => 'Friday', '6' => 'Saturday'];
        $dayOfWeek = array_map(function($r) use ($dowMap) {
            return [
                'day' => $dowMap[$r['dow']] ?? 'Unknown',
                'rate' => $r['total'] > 0 ? number_format(($r['present'] / $r['total']) * 100, 1) : "0"
            ];
        }, $dayOfWeekRecords);

        // 4. Consecutive Absences
        $recentAtt = $pdo->query("
            SELECT s.id, s.name, c.name as class_name, a.date, a.status
            FROM students s
            JOIN classes c ON s.class_id = c.id
            JOIN attendance a ON s.id = a.student_id
            WHERE a.date >= date('now', '-14 days')
            ORDER BY s.id, a.date DESC
        ")->fetchAll();
        
        $consecutiveAbsences = [];
        $currentStudent = null;
        $streak = 0;
        $lastRow = null;
        foreach ($recentAtt as $row) {
            if ($currentStudent !== $row['id']) {
                if ($streak >= 3) {
                    $consecutiveAbsences[] = [
                        'name' => $lastRow['name'],
                        'className' => $lastRow['class_name'],
                        'streak' => $streak
                    ];
                }
                $currentStudent = $row['id'];
                $streak = 0;
                $lastRow = $row;
            }
            if ($streak >= 0) {
                if ($row['status'] === 'A') {
                    $streak++;
                } else if ($row['status'] === 'P') {
                    $streak = -999;
                }
            }
        }
        if ($streak >= 3) {
             $consecutiveAbsences[] = [
                 'name' => $lastRow['name'],
                 'className' => $lastRow['class_name'],
                 'streak' => $streak
             ];
        }

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

        // 5. Six Month Trend
        $sixMonthRecords = $pdo->query("
            SELECT strftime('%Y-%m', date) as month, 
                   SUM(CASE WHEN status = 'P' THEN 1 ELSE 0 END) as present,
                   COUNT(*) as total
            FROM attendance 
            WHERE date >= date('now', '-6 months') AND (status = 'P' OR status = 'A')
            GROUP BY month
            ORDER BY month ASC
        ")->fetchAll();
        $sixMonthTrend = array_map(function($r) {
            return [
                'month' => $r['month'],
                'rate' => $r['total'] > 0 ? number_format(($r['present'] / $r['total']) * 100, 1) : "0"
            ];
        }, $sixMonthRecords);

        // 6. Top Students (Top 5)
        $topStudentsRecords = $pdo->query("
            SELECT s.name, c.name as class_name,
                   SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END) as present,
                   COUNT(a.id) as total
            FROM students s
            JOIN classes c ON s.class_id = c.id
            JOIN attendance a ON s.id = a.student_id
            WHERE (a.status = 'P' OR a.status = 'A')
            GROUP BY s.id
            HAVING total >= 5
            ORDER BY (present * 1.0 / total) DESC
            LIMIT 5
        ")->fetchAll();
        $topStudents = array_map(function($r) {
            return [
                'name' => $r['name'],
                'className' => $r['class_name'],
                'rate' => $r['total'] > 0 ? number_format(($r['present'] / $r['total']) * 100, 1) : "0"
            ];
        }, $topStudentsRecords);

        // 7. Class Radar
        $classRadarRecords = $pdo->query("
            SELECT c.name, 
                   SUM(CASE WHEN a.status = 'P' THEN 1 ELSE 0 END) as present,
                   COUNT(a.status) as total
            FROM classes c
            LEFT JOIN students s ON c.id = s.class_id
            LEFT JOIN attendance a ON s.id = a.student_id AND (a.status = 'P' OR a.status = 'A')
            GROUP BY c.id
        ")->fetchAll();
        $classRadar = array_map(function($r) {
            return [
                'name' => $r['name'],
                'rate' => $r['total'] > 0 ? number_format(($r['present'] / $r['total']) * 100, 1) : "0"
            ];
        }, $classRadarRecords);

        echo json_encode([
            'totalClasses' => $totalClasses,
            'totalStudents' => $totalStudents,
            'todayRate' => $todayRate,
            'trend' => $trend,
            'todayStats' => [
                'present' => (int)$todayStats['present'] ?: 0,
                'absent' => (int)$todayStats['absent'] ?: 0
            ],
            'classAttendance' => $classAttendance,
            'heatmap' => $heatmap,
            'atRisk' => $atRisk,
            'dayOfWeek' => $dayOfWeek,
            'consecutiveAbsences' => $consecutiveAbsences,
            'sixMonthTrend' => $sixMonthTrend,
            'topStudents' => $topStudents,
            'classRadar' => $classRadar
        ]);
    }
}
