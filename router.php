<?php
// router.php - Entry point for PHP built-in server

// CORS headers for local dev if needed
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// If the request is for an API endpoint
if (strpos($requestUri, '/api/') === 0) {
    // Route to the API Front Controller
    require __DIR__ . '/api/index.php';
    return true; // Stop built-in server from executing further
}

// Serve static files from 'public' directory if they exist
$publicFile = __DIR__ . '/public' . $requestUri;
if ($requestUri !== '/' && file_exists($publicFile) && is_file($publicFile)) {
    $ext = pathinfo($publicFile, PATHINFO_EXTENSION);
    $mimes = [
        'css' => 'text/css', 
        'js' => 'application/javascript', 
        'png' => 'image/png', 
        'jpg' => 'image/jpeg', 
        'svg' => 'image/svg+xml',
        'json' => 'application/json'
    ];
    if (isset($mimes[$ext])) {
        header('Content-Type: ' . $mimes[$ext]);
    }
    readfile($publicFile);
    return true;
}

// Serve root URL
if ($requestUri === '/') {
    require __DIR__ . '/templates/landing.html';
    return true;
}

// Fallback to index.html (SPA routing)
if (file_exists(__DIR__ . '/index.html')) {
    require __DIR__ . '/index.html';
    return true;
}

// 404
http_response_code(404);
echo "404 Not Found";
return true;
