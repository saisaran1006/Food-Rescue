<?php
// Get Authenticated User Details Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = AuthMiddleware::requireAuth();

$db = Database::getConnection();

// Unread notifications count
$notifStmt = $db->prepare("SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = :uid AND is_read = 0");
$notifStmt->execute([':uid' => $user['id']]);
$notifRes = $notifStmt->fetch();
$user['unread_notifications'] = (int)($notifRes['unread_count'] ?? 0);

jsonResponse(true, 'User details retrieved successfully', [
    'user' => $user
]);
