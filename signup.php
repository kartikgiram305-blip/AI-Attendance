<?php
// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

header("Content-Type: application/json");

if (file_exists(__DIR__ . '/AI-Attendance-main/vendor/autoload.php')) {
    require_once __DIR__ . '/AI-Attendance-main/vendor/autoload.php';
} elseif (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

use App\Config\Database;
use Firebase\JWT\JWT;

$inputRaw = file_get_contents('php://input');
$input = json_decode($inputRaw, true) ?: $_POST;

$fullName = trim($input['fullName'] ?? $input['name'] ?? $input['full_name'] ?? '');
$institution = trim($input['institution'] ?? $input['institutionName'] ?? '');
$email = trim($input['email'] ?? $input['workEmail'] ?? '');
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Work email and password are required.']);
    exit;
}

try {
    $pdo = Database::getConnection();
    
    // Check if user already exists
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? OR username = ?");
    $stmt->execute([$email, $email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'An account with this email already exists.']);
        exit;
    }
    
    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);
    $username = $email;
    
    $insert = $pdo->prepare("INSERT INTO users (username, email, full_name, institution, password) VALUES (?, ?, ?, ?, ?)");
    $insert->execute([$username, $email, $fullName, $institution, $hashedPassword]);
    $userId = $pdo->lastInsertId();
    
    $secret = getenv('JWT_SECRET') ?: 'super_secret_attendai_key_change_me_in_prod';
    $payload = [
        'id' => $userId,
        'email' => $email,
        'username' => $username,
        'iat' => time(),
        'exp' => time() + (24 * 60 * 60)
    ];
    
    $token = class_exists('Firebase\JWT\JWT') ? JWT::encode($payload, $secret, 'HS256') : base64_encode(json_encode($payload));
    
    $userData = [
        'id' => $userId,
        'name' => $fullName ?: $email,
        'email' => $email,
        'username' => $username,
        'institution' => $institution ?: 'AttendAI Institute'
    ];

    echo json_encode([
        'success' => true,
        'userToken' => $token,
        'token' => $token,
        'userData' => $userData,
        'username' => $username
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
