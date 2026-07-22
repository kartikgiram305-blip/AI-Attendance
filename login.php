<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json");

// Autoload composer
if (file_exists(__DIR__ . '/AI-Attendance-main/vendor/autoload.php')) {
    require_once __DIR__ . '/AI-Attendance-main/vendor/autoload.php';
} elseif (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

use App\Config\Database;
use Firebase\JWT\JWT;

$inputRaw = file_get_contents('php://input');
$input = json_decode($inputRaw, true) ?: $_POST;

$email = trim($input['email'] ?? $input['username'] ?? $input['workEmail'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password are required.']);
    exit;
}

try {
    $pdo = Database::getConnection();
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$email, $email]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password'])) {
        $secret = getenv('JWT_SECRET') ?: 'super_secret_attendai_key_change_me_in_prod';
        $payload = [
            'id' => $user['id'],
            'email' => $user['email'] ?? $user['username'],
            'username' => $user['username'] ?? $user['email'],
            'iat' => time(),
            'exp' => time() + (24 * 60 * 60)
        ];
        
        $token = class_exists('Firebase\JWT\JWT') ? JWT::encode($payload, $secret, 'HS256') : base64_encode(json_encode($payload));
        
        $userData = [
            'id' => $user['id'],
            'name' => $user['full_name'] ?: ($user['username'] ?: 'User'),
            'email' => $user['email'] ?: $user['username'],
            'username' => $user['username'] ?: $user['email'],
            'institution' => $user['institution'] ?: 'AttendAI Institute'
        ];

        echo json_encode([
            'success' => true,
            'userToken' => $token,
            'token' => $token,
            'userData' => $userData,
            'username' => $userData['username']
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid email or password']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
