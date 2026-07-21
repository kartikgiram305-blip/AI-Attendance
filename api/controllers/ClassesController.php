<?php
namespace App\Controllers;

use App\Config\Database;

class ClassesController {
    public function index() {
        $pdo = Database::getConnection();
        $stmt = $pdo->query("SELECT * FROM classes ORDER BY created_at DESC");
        $classes = $stmt->fetchAll();
        
        $countStmt = $pdo->prepare("SELECT COUNT(*) as count FROM students WHERE class_id = ?");
        
        foreach ($classes as &$class) {
            $countStmt->execute([$class['id']]);
            $count = $countStmt->fetch();
            $class['studentCount'] = (int)$count['count'];
        }
        
        echo json_encode($classes);
    }

    public function create() {
        $data = $_POST;
        if (empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name is required']);
            return;
        }
        
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("INSERT INTO classes (name) VALUES (?)");
        $stmt->execute([$data['name']]);
        
        echo json_encode(['id' => $pdo->lastInsertId(), 'name' => $data['name']]);
    }

    public function update($id) {
        $data = $_POST;
        if (empty($data['name'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Name is required']);
            return;
        }
        
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE classes SET name = ? WHERE id = ?");
        $stmt->execute([$data['name'], $id]);
        
        echo json_encode(['success' => true]);
    }

    public function delete($id) {
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("DELETE FROM classes WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true]);
    }
}
