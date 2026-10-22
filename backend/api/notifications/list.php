<?php
// Notifications List Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = AuthMiddleware::requireAuth();
$db = Database::getConnection();

$stmt = $db->prepare("
    SELECT * FROM notifications 
    WHERE user_id = :uid 
    ORDER BY created_at DESC 
    LIMIT 50
");
$stmt->execute([':uid' => $user['id']]);
$notifications = $stmt->fetchAll();

$uCountStmt = $db->prepare("SELECT COUNT(*) as c FROM notifications WHERE user_id = :uid AND is_read = 0");
$uCountStmt->execute([':uid' => $user['id']]);
$unreadCount = (int)$uCountStmt->fetch()['c'];

jsonResponse(true, 'Notifications retrieved', [
    'notifications' => $notifications,
    'unread_count' => $unreadCount
]);
