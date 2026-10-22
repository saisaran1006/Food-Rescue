<?php
// Mark Notifications as Read Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed', null, 405);
}

$user = AuthMiddleware::requireAuth();
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$notifId = isset($input['id']) ? intval($input['id']) : null;
$markAll = isset($input['mark_all']) && $input['mark_all'] == true;

$db = Database::getConnection();

if ($markAll) {
    $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = :uid");
    $stmt->execute([':uid' => $user['id']]);
    jsonResponse(true, 'All notifications marked as read.');
} elseif ($notifId > 0) {
    $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE id = :id AND user_id = :uid");
    $stmt->execute([':id' => $notifId, ':uid' => $user['id']]);
    jsonResponse(true, 'Notification marked as read.');
} else {
    jsonResponse(false, 'Invalid notification ID or mark_all flag.', null, 400);
}
