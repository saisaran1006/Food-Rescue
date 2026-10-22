<?php
// Cancel Donation Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed', null, 405);
}

$user = AuthMiddleware::requireAuth();
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$donationId = intval($input['donation_id'] ?? 0);
$reason = trim($input['reason'] ?? 'Cancelled by donor');

if ($donationId <= 0) {
    jsonResponse(false, 'Invalid donation ID.', null, 400);
}

$db = Database::getConnection();

$stmt = $db->prepare("SELECT * FROM donations WHERE id = :id LIMIT 1");
$stmt->execute([':id' => $donationId]);
$donation = $stmt->fetch();

if (!$donation) {
    jsonResponse(false, 'Donation not found.', null, 404);
}

// Check authorization
if ($user['role'] !== 'ADMIN' && $donation['donor_id'] != $user['id']) {
    jsonResponse(false, 'You do not have permission to cancel this donation.', null, 403);
}

if (in_array($donation['status'], ['PICKED_UP', 'COMPLETED'])) {
    jsonResponse(false, "Cannot cancel donation that is already '{$donation['status']}'.", null, 400);
}

try {
    $db->beginTransaction();

    $uStmt = $db->prepare("UPDATE donations SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP WHERE id = :id");
    $uStmt->execute([':id' => $donationId]);

    // If claimed, update claim status and notify NGO
    if ($donation['claimed_by']) {
        $cStmt = $db->prepare("UPDATE donation_claims SET claim_status = 'CANCELLED' WHERE donation_id = :did");
        $cStmt->execute([':did' => $donationId]);

        $notifStmt = $db->prepare("
            INSERT INTO notifications (user_id, title, message, type, related_id)
            VALUES (:uid, 'Donation Cancelled', :msg, 'ALERT', :did)
        ");
        $notifStmt->execute([
            ':uid' => $donation['claimed_by'],
            ':msg' => "Donation #{$donationId} \"{$donation['food_name']}\" was cancelled by donor: {$reason}",
            ':did' => $donationId
        ]);
    }

    $db->commit();
    jsonResponse(true, 'Donation cancelled successfully.', ['status' => 'CANCELLED']);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    jsonResponse(false, 'Failed to cancel donation: ' . $e->getMessage(), null, 500);
}
