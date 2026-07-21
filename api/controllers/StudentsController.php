<?php
namespace App\Controllers;

use App\Config\Database;
use PhpOffice\PhpSpreadsheet\IOFactory;

class StudentsController {
    public function index() {
        $classId = isset($_GET['classId']) ? $_GET['classId'] : null;
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
        
        if (!$classId) {
            http_response_code(400);
            echo json_encode(['error' => 'classId is required']);
            return;
        }
        
        $offset = ($page - 1) * $limit;
        
        $pdo = Database::getConnection();
        
        $stmt = $pdo->prepare("SELECT * FROM students WHERE class_id = ? ORDER BY name ASC LIMIT ? OFFSET ?");
        $stmt->execute([$classId, $limit, $offset]);
        $students = $stmt->fetchAll();
        
        $countStmt = $pdo->prepare("SELECT COUNT(*) as count FROM students WHERE class_id = ?");
        $countStmt->execute([$classId]);
        $total = (int)$countStmt->fetch()['count'];
        
        echo json_encode([
            'data' => $students,
            'total' => $total,
            'page' => $page,
            'limit' => $limit
        ]);
    }

    public function create() {
        $data = $_POST;
        if (empty($data['classId']) || empty($data['name']) || empty($data['email']) || empty($data['contact'])) {
            http_response_code(400);
            echo json_encode(['error' => 'classId, name, email, and contact are required']);
            return;
        }
        
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO students (class_id, name, email, contact_number) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['classId'], $data['name'], $data['email'], $data['contact']]);
        
        echo json_encode([
            'id' => $pdo->lastInsertId(),
            'class_id' => $data['classId'],
            'name' => $data['name'],
            'email' => $data['email'],
            'contact_number' => $data['contact']
        ]);
    }

    public function update($id) {
        $data = $_POST;
        if (empty($data['name']) || empty($data['email']) || empty($data['contact'])) {
            http_response_code(400);
            echo json_encode(['error' => 'name, email, and contact are required']);
            return;
        }
        
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE students SET name = ?, email = ?, contact_number = ? WHERE id = ?");
        $stmt->execute([$data['name'], $data['email'], $data['contact'], $id]);
        
        echo json_encode(['success' => true]);
    }

    public function delete($id) {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM students WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    }

    public function import() {
        $classId = isset($_POST['classId']) ? $_POST['classId'] : null;
        if (!$classId || !isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'Class ID and valid file are required']);
            return;
        }
        
        $filePath = $_FILES['file']['tmp_name'];
        
        try {
            $spreadsheet = IOFactory::load($filePath);
            $sheet = $spreadsheet->getActiveSheet();
            $data = $sheet->toArray();
            
            if (count($data) < 2) {
                http_response_code(400);
                echo json_encode(['error' => 'File empty']);
                return;
            }
            
            $headers = array_map(function($h) { return $h ? strtolower((string)$h) : ''; }, $data[0]);
            
            $nameIdx = -1;
            $emailIdx = -1;
            $contactIdx = -1;
            
            foreach ($headers as $i => $h) {
                if (strpos($h, 'name') !== false) $nameIdx = $i;
                if (strpos($h, 'email') !== false) $emailIdx = $i;
                if (strpos($h, 'contact') !== false) $contactIdx = $i;
            }
            
            if ($nameIdx === -1) {
                http_response_code(400);
                echo json_encode(['error' => 'Name column not found']);
                return;
            }
            
            $pdo = Database::getConnection();
            $stmt = $pdo->prepare("INSERT INTO students (class_id, name, email, contact_number) VALUES (?, ?, ?, ?)");
            
            $pdo->beginTransaction();
            for ($i = 1; $i < count($data); $i++) {
                $row = $data[$i];
                if (!empty($row) && !empty($row[$nameIdx])) {
                    $email = ($emailIdx !== -1 && !empty($row[$emailIdx])) ? $row[$emailIdx] : 'no-email@domain.com';
                    $contact = ($contactIdx !== -1 && !empty($row[$contactIdx])) ? $row[$contactIdx] : '0000000000';
                    $stmt->execute([$classId, $row[$nameIdx], $email, $contact]);
                }
            }
            $pdo->commit();
            
            echo json_encode(['success' => true]);
        } catch (\Exception $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to process file: ' . $e->getMessage()]);
        }
    }
}
