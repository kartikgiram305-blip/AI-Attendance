<?php
namespace App\Controllers;

use App\Config\Database;
use Firebase\JWT\JWT;

class AuthController {
    public function login() {
        $data = $_POST;
        if (empty($data['username']) || empty($data['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Username and password required']);
            return;
        }

        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
        $stmt->execute([$data['username']]);
        $user = $stmt->fetch();

        if ($user && password_verify($data['password'], $user['password'])) {
            $secret = getenv('JWT_SECRET');
            if (!$secret) {
                $secret = 'super_secret_attendai_key_change_me_in_prod';
            }
            
            $payload = [
                'id' => $user['id'],
                'username' => $user['username'],
                'iat' => time(),
                'exp' => time() + (24 * 60 * 60) // 24h
            ];
            
            $token = JWT::encode($payload, $secret, 'HS256');
            
            $preferences = $user['preferences'] ? json_decode($user['preferences'], true) : null;
            
            echo json_encode([
                'token' => $token, 
                'username' => $user['username'],
                'preferences' => $preferences
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
        }
    }
    
    public function me() {
        $userId = $GLOBALS['user']->id;
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("SELECT username, preferences FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        if ($user) {
            $preferences = $user['preferences'] ? json_decode($user['preferences'], true) : null;
            echo json_encode([
                'username' => $user['username'],
                'preferences' => $preferences
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
        }
    }
    
    public function updatePreferences() {
        $userId = $GLOBALS['user']->id;
        $data = $_POST;
        
        if (!isset($data['preferences']) || !is_array($data['preferences'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid preferences format']);
            return;
        }
        
        $pdo = Database::getConnection();
        $stmt = $pdo->prepare("UPDATE users SET preferences = ? WHERE id = ?");
        $stmt->execute([json_encode($data['preferences']), $userId]);
        
        echo json_encode(['success' => true]);
    }
}
