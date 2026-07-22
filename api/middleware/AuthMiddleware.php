<?php
namespace App\Middleware;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class AuthMiddleware {
    public static function handle() {
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { // Nginx or fast CGI
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }
        
        if (empty($headers)) {
            http_response_code(401);
            echo json_encode(['error' => 'No token provided']);
            exit;
        }
        
        if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
            $token = $matches[1];
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid token format']);
            exit;
        }
        
        $secret = getenv('JWT_SECRET');
        if (!$secret) {
            $secret = 'super_secret_attendai_key_change_me_in_prod';
        }
        
        try {
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            // Store user in global for controllers to access if needed
            $GLOBALS['user'] = $decoded;
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }
    }
}
