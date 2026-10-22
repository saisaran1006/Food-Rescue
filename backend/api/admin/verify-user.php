<?php
// Admin User Verification & Action Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed', null, 405);
}

$admin = AuthMiddleware::requireRole(['ADMIN']);
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$userId = intval($input['user_id'] ?? 0);
$action = strtoupper(trim($input['action'] ?? '')); // VERIFY, REJECT, SUSPEND, REACTIVATE
$reason = trim($input['reason'] ?? 'Admin action performed');

if ($userId <= 0 || !in_array($action, ['VERIFY', 'REJECT', 'SUSPEND', 'REACTIVATE'])) {
    jsonResponse(false, 'Valid user ID and action (VERIFY, REJECT, SUSPEND, REACTIVATE) are required.', null, 422);
}

$db = Database::getConnection();

$stmt = $db->prepare("SELECT * FROM users WHERE id = :id AND role != 'ADMIN' LIMIT 1");
$stmt->execute([':id' => $userId]);
$targetUser = $stmt->fetch();

if (!$targetUser) {
    jsonResponse(false, 'User not found or is an administrator.', null, 404);
}

$statusMap = [
    'VERIFY' => 'VERIFIED',
    'REJECT' => 'REJECTED',
    'SUSPEND' => 'SUSPENDED',
    'REACTIVATE' => 'VERIFIED'
];

$newStatus = $statusMap[$action];

try {
    $db->beginTransaction();

    $uStmt = $db->prepare("UPDATE users SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id");
    $uStmt->execute([':status' => $newStatus, ':id' => $userId]);

    // Record audit trail
    $auditStmt = $db->prepare("
        INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
        VALUES (:aid, :atype, 'USER', :tid, :details)
    ");
    $auditStmt->execute([
        ':aid' => $admin['id'],
        ':atype' => "USER_{$action}",
        ':tid' => $userId,
        ':details' => "Status changed to {$newStatus}. Reason/Notes: {$reason}"
    ]);

    // Notify user
    $messages = [
        'VERIFY' => 'Your FoodRescue account has been successfully verified! You now have full access to platform features.',
        'REJECT' => 'Your FoodRescue verification request could not be approved. Reason: ' . $reason,
        'SUSPEND' => 'Your account has been suspended by an administrator. Please reach out to support.',
        'REACTIVATE' => 'Your account has been reactivated with verified privileges.'
    ];

    $notifStmt = $db->prepare("
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES (:uid, :title, :msg, 'USER_VERIFIED', :rid)
    ");
    $notifStmt->execute([
        ':uid' => $userId,
        ':title' => "Account Status Updated: {$newStatus}",
        ':msg' => $messages[$action],
        ':rid' => $admin['id']
    ]);

    $db->commit();

    jsonResponse(true, "User account successfully {$action}ED.", [
        'user_id' => $userId,
        'new_status' => $newStatus
    ]);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    jsonResponse(false, 'Action failed: ' . $e->getMessage(), null, 500);
}
