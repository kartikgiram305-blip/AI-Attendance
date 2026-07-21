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
            
            echo json_encode(['token' => $token, 'username' => $user['username']]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
        }
    }
}
