<?php
namespace App\Controllers;

use App\Config\Database;

class AttendanceController {
    public function index() {
        $classId = isset($_GET['classId']) ? $_GET['classId'] : null;
        $month = isset($_GET['month']) ? $_GET['month'] : null;
        
        if (!$classId || !$month) {
            http_response_code(400);
            echo json_encode(['error' => 'classId and month required']);
            return;
        }
        
        $pdo = Database::getConnection();
        
        $stmt = $pdo->prepare("SELECT * FROM students WHERE class_id = ? ORDER BY name ASC");
        $stmt->execute([$classId]);
        $students = $stmt->fetchAll();
        
        $attStmt = $pdo->prepare("
            SELECT a.* FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE s.class_id = ? AND a.date LIKE ?
        ");
        $attStmt->execute([$classId, "$month-%"]);
        $attendance = $attStmt->fetchAll();
        
        $attMap = [];
        foreach ($students as $s) {
            $attMap[$s['id']] = [];
        }
        
        foreach ($attendance as $a) {
            if (isset($attMap[$a['student_id']])) {
                $attMap[$a['student_id']][$a['date']] = $a['status'];
            }
        }
        
        $result = [];
        foreach ($students as $s) {
            $result[] = [
                'student_id' => $s['id'],
                'name' => $s['name'],
                'email' => $s['email'],
                'contact' => $s['contact_number'],
                'attendance' => $attMap[$s['id']]
            ];
        }
        
        echo json_encode($result);
    }

    public function create() {
        $data = $_POST;
        if (empty($data['classId']) || empty($data['date']) || !isset($data['records'])) {
            http_response_code(400);
            echo json_encode(['error' => 'classId, date, and records required']);
            return;
        }
        
        $date = $data['date'];
        $records = $data['records'];
        
        $pdo = Database::getConnection();
        
        $insertStmt = $pdo->prepare("
            INSERT INTO attendance (student_id, date, status) 
            VALUES (?, ?, ?)
            ON CONFLICT(student_id, date) DO UPDATE SET status=excluded.status
        ");
        
        $deleteStmt = $pdo->prepare("DELETE FROM attendance WHERE student_id = ? AND date = ?");
        
        $pdo->beginTransaction();
        foreach ($records as $r) {
            if ($r['status'] === 'P' || $r['status'] === 'A') {
                $insertStmt->execute([$r['student_id'], $date, $r['status']]);
            } else if ($r['status'] === null || $r['status'] === '') {
                $deleteStmt->execute([$r['student_id'], $date]);
            }
        }
        $pdo->commit();
        
        echo json_encode(['success' => true]);
    }

    public function export() {
        $classId = isset($_GET['classId']) ? $_GET['classId'] : null;
        $month = isset($_GET['month']) ? $_GET['month'] : null;
        
        if (!$classId || !$month) {
            http_response_code(400);
            echo json_encode(['error' => 'classId and month required']);
            return;
        }
        
        $pdo = Database::getConnection();
        
        $clsStmt = $pdo->prepare("SELECT name FROM classes WHERE id = ?");
        $clsStmt->execute([$classId]);
        $cls = $clsStmt->fetch();
        
        if (!$cls) {
            http_response_code(404);
            echo json_encode(['error' => 'Class not found']);
            return;
        }
        
        $stmt = $pdo->prepare("SELECT * FROM students WHERE class_id = ? ORDER BY name ASC");
        $stmt->execute([$classId]);
        $students = $stmt->fetchAll();
        
        $attStmt = $pdo->prepare("
            SELECT a.* FROM attendance a
            JOIN students s ON a.student_id = s.id
            WHERE s.class_id = ? AND a.date LIKE ?
        ");
        $attStmt->execute([$classId, "$month-%"]);
        $attendance = $attStmt->fetchAll();
        
        list($year, $monthStr) = explode('-', $month);
        $daysInMonth = cal_days_in_month(CAL_GREGORIAN, (int)$monthStr, (int)$year);
        
        $headers = ['Student Name', 'Email', 'Contact', 'Total Present', 'Total Absent', 'Attendance %'];
        for ($i = 1; $i <= $daysInMonth; $i++) {
            $headers[] = (string)$i;
        }
        
        $attMap = [];
        foreach ($students as $s) {
            $attMap[$s['id']] = [];
        }
        foreach ($attendance as $a) {
            if (isset($attMap[$a['student_id']])) {
                $attMap[$a['student_id']][$a['date']] = $a['status'];
            }
        }
        
        $filename = preg_replace('/\s+/', '_', $cls['name']) . "_Attendance_$month.csv";
        
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        
        $output = fopen('php://output', 'w');
        fputcsv($output, $headers);
        
        foreach ($students as $s) {
            $totalP = 0;
            $totalA = 0;
            $row = [
                $s['name'],
                $s['email'],
                $s['contact_number']
            ];
            
            $daysStatuses = [];
            for ($i = 1; $i <= $daysInMonth; $i++) {
                $dStr = sprintf("%s-%s-%02d", $year, $monthStr, $i);
                $status = isset($attMap[$s['id']][$dStr]) ? $attMap[$s['id']][$dStr] : '-';
                $daysStatuses[] = $status;
                if ($status === 'P') $totalP++;
                if ($status === 'A') $totalA++;
            }
            
            $row[] = $totalP;
            $row[] = $totalA;
            $total = $totalP + $totalA;
            $row[] = $total > 0 ? number_format(($totalP / $total) * 100, 1) . '%' : '0.0%';
            
            foreach ($daysStatuses as $st) {
                $row[] = $st;
            }
            
            fputcsv($output, $row);
        }
        fclose($output);
    }
}
