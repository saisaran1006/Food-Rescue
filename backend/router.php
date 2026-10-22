<?php
// FoodRescue Local PHP Built-in Server Router
// Handles CORS preflight and routes API requests

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: {$origin}");
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve static uploaded files
if (strpos($uri, '/uploads/') !== false || strpos($uri, '/backend/uploads/') !== false) {
    $filePath = __DIR__ . '/uploads/' . basename($uri);
    if (file_exists($filePath) && is_file($filePath)) {
        $mime = mime_content_type($filePath);
        header("Content-Type: {$mime}");
        readfile($filePath);
        exit;
    }
}

// Normalize URI
$cleanUri = preg_replace('#^/backend#', '', $uri);

// Map API endpoints
$routes = [
    // Auth
    '/api/auth/register' => __DIR__ . '/api/auth/register.php',
    '/api/auth/login' => __DIR__ . '/api/auth/login.php',
    '/api/auth/logout' => __DIR__ . '/api/auth/logout.php',
    '/api/auth/me' => __DIR__ . '/api/auth/me.php',
    '/api/auth/change-password' => __DIR__ . '/api/auth/change-password.php',

    // Donations
    '/api/donations/create' => __DIR__ . '/api/donations/create.php',
    '/api/donations/list' => __DIR__ . '/api/donations/list.php',
    '/api/donations/details' => __DIR__ . '/api/donations/details.php',
    '/api/donations/claim' => __DIR__ . '/api/donations/claim.php',
    '/api/donations/cancel' => __DIR__ . '/api/donations/cancel.php',
    '/api/donations/recommended' => __DIR__ . '/api/donations/recommended.php',

    // Pickups
    '/api/pickups/schedule' => __DIR__ . '/api/pickups/schedule.php',
    '/api/pickups/update-status' => __DIR__ . '/api/pickups/update-status.php',
    '/api/pickups/verify' => __DIR__ . '/api/pickups/verify.php',

    // Notifications
    '/api/notifications/list' => __DIR__ . '/api/notifications/list.php',
    '/api/notifications/read' => __DIR__ . '/api/notifications/read.php',

    // Users & Impact
    '/api/users/profile' => __DIR__ . '/api/users/profile.php',
    '/api/users/impact' => __DIR__ . '/api/users/impact.php',

    // Admin
    '/api/admin/dashboard' => __DIR__ . '/api/admin/dashboard.php',
    '/api/admin/analytics' => __DIR__ . '/api/admin/analytics.php',
    '/api/admin/users' => __DIR__ . '/api/admin/users.php',
    '/api/admin/verify-user' => __DIR__ . '/api/admin/verify-user.php',
    '/api/admin/audit-logs' => __DIR__ . '/api/admin/audit-logs.php',
];

$cleanUriNoPhp = preg_replace('/\.php$/', '', rtrim($cleanUri, '/'));

if (isset($routes[$cleanUriNoPhp])) {
    require $routes[$cleanUriNoPhp];
    exit;
}

// Check direct file match
$directFile = __DIR__ . $cleanUri;
if (file_exists($directFile) && is_file($directFile)) {
    return false; // serve directly
}

if (file_exists($directFile . '.php') && is_file($directFile . '.php')) {
    require $directFile . '.php';
    exit;
}

// Default 404
header("Content-Type: application/json; charset=UTF-8");
http_response_code(404);
echo json_encode([
    'success' => false,
    'message' => 'API endpoint not found: ' . $uri
]);
