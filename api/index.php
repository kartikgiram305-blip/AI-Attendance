<?php
require dirname(__DIR__) . '/vendor/autoload.php';

// Dotenv isn't needed if we use getenv or putenv in php, but normally we'd load .env here.
// Since we are rewriting, we can write a simple .env parser.
$envFile = dirname(__DIR__) . '/.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) continue;
        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Ensure JSON parsing for input
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
    if (strpos($contentType, 'application/json') !== false) {
        $content = trim(file_get_contents("php://input"));
        $decoded = json_decode($content, true);
        if (is_array($decoded)) {
            $_POST = $decoded;
        }
    }
}

header('Content-Type: application/json');

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Helper for sending JSON responses
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data);
    exit;
}

// Simple Router
$routes = [
    'POST /api/login' => 'App\Controllers\AuthController@login',
    'GET /api/user/me' => 'App\Controllers\AuthController@me',
    'PUT /api/user/preferences' => 'App\Controllers\AuthController@updatePreferences',
    
    'GET /api/classes' => 'App\Controllers\ClassesController@index',
    'POST /api/classes' => 'App\Controllers\ClassesController@create',
    'PUT /api/classes' => 'App\Controllers\ClassesController@update',
    'DELETE /api/classes' => 'App\Controllers\ClassesController@delete',
    
    'GET /api/students' => 'App\Controllers\StudentsController@index',
    'POST /api/students' => 'App\Controllers\StudentsController@create',
    'PUT /api/students' => 'App\Controllers\StudentsController@update',
    'DELETE /api/students' => 'App\Controllers\StudentsController@delete',
    'POST /api/students/import' => 'App\Controllers\StudentsController@import',
    
    'GET /api/attendance' => 'App\Controllers\AttendanceController@index',
    'POST /api/attendance' => 'App\Controllers\AttendanceController@create',
    'GET /api/attendance/export' => 'App\Controllers\AttendanceController@export',
    
    'GET /api/dashboard/stats' => 'App\Controllers\DashboardController@stats',
    
    'GET /api/notifications/preview' => 'App\Controllers\NotificationsController@preview',
    'GET /api/notifications/pending' => 'App\Controllers\NotificationsController@pending',
    'GET /api/notifications/history' => 'App\Controllers\NotificationsController@history',
    'POST /api/notifications/send' => 'App\Controllers\NotificationsController@send',
    'POST /api/notifications/send-single' => 'App\Controllers\NotificationsController@sendSingle',
    'POST /api/notifications/twilio-voice-callback' => 'App\Controllers\NotificationsController@twilioVoiceCallback',
];

// Check if route requires auth (everything except login and twilio callback)
$publicRoutes = [
    'POST /api/login',
    'POST /api/notifications/twilio-voice-callback'
];

$routeFound = false;

foreach ($routes as $routePattern => $handler) {
    list($routeMethod, $routePath) = explode(' ', $routePattern);
    
    // Check match for exact routes or param routes (like /api/classes/{id})
    $pattern = preg_replace('/\{[a-zA-Z0-9_]+\}/', '([a-zA-Z0-9_]+)', $routePath);
    $pattern = "@^" . $pattern . "$@D";
    
    if ($method === $routeMethod && preg_match($pattern, $requestUri, $matches)) {
        array_shift($matches); // remove the full match
        
        $routeFound = true;
        
        if (!in_array($routePattern, $publicRoutes)) {
            App\Middleware\AuthMiddleware::handle();
        }
        
        list($controllerClass, $methodName) = explode('@', $handler);
        if (!class_exists($controllerClass)) {
            // we will require the file directly since composer psr-4 autoload will do it if dump-autoload is run.
            // But we will manually require just to be safe if dump-autoload is missing
            $classFile = __DIR__ . '/controllers/' . basename(str_replace('\\', '/', $controllerClass)) . '.php';
            if (file_exists($classFile)) require_once $classFile;
        }
        
        $controller = new $controllerClass();
        call_user_func_array([$controller, $methodName], $matches);
        break;
    }
}

// Special case for PUT/DELETE with ID where it wasn't defined exactly in the array
// We need to add them. Let's adjust the simple router to handle /id
if (!$routeFound) {
    // Dynamic matching for ID based routes
    if (preg_match('@^/api/(classes|students)/([0-9]+)$@', $requestUri, $matches)) {
        $resource = $matches[1];
        $id = $matches[2];
        $controllerClass = $resource === 'classes' ? 'App\Controllers\ClassesController' : 'App\Controllers\StudentsController';
        
        App\Middleware\AuthMiddleware::handle();
        
        $classFile = __DIR__ . '/controllers/' . basename(str_replace('\\', '/', $controllerClass)) . '.php';
        if (file_exists($classFile)) require_once $classFile;
        
        $controller = new $controllerClass();
        
        if ($method === 'PUT') {
            $controller->update($id);
            $routeFound = true;
        } else if ($method === 'DELETE') {
            $controller->delete($id);
            $routeFound = true;
        }
    }
}

if (!$routeFound) {
    jsonResponse(['error' => 'Route not found'], 404);
}
