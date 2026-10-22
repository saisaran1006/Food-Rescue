<?php
// Claim Donation Endpoint with Concurrency & Race-Condition Protection
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed', null, 405);
}

$user = AuthMiddleware::requireRole(['NGO', 'ADMIN']);

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;
$donationId = intval($input['donation_id'] ?? 0);
$notes = trim($input['notes'] ?? 'Claimed by registered NGO');

if ($donationId <= 0) {
    jsonResponse(false, 'Valid donation ID is required.', null, 400);
}

$db = Database::getConnection();

try {
    $db->beginTransaction();

    // Atomic fetch with status check
    $driver = Database::getDriver();
    if ($driver === 'mysql') {
        $checkStmt = $db->prepare("SELECT * FROM donations WHERE id = :id FOR UPDATE");
    } else {
        $checkStmt = $db->prepare("SELECT * FROM donations WHERE id = :id");
    }
    $checkStmt->execute([':id' => $donationId]);
    $donation = $checkStmt->fetch();

    if (!$donation) {
        $db->rollBack();
        jsonResponse(false, 'Donation not found.', null, 404);
    }

    if ($donation['status'] !== 'AVAILABLE') {
        $db->rollBack();
        jsonResponse(false, "Cannot claim donation. Current status is already '{$donation['status']}'. Another NGO may have claimed it.", null, 409);
    }

    // Check expiry
    $now = new DateTime();
    $expiry = new DateTime($donation['expiry_time']);
    if ($expiry <= $now) {
        // Mark expired
        $expStmt = $db->prepare("UPDATE donations SET status = 'EXPIRED' WHERE id = :id");
        $expStmt->execute([':id' => $donationId]);
        $db->commit();
        jsonResponse(false, 'Cannot claim this donation because it has exceeded its consumption deadline.', null, 400);
    }

    // Update donation status
    $nowFormatted = date('Y-m-d H:i:s');
    $updateStmt = $db->prepare("
        UPDATE donations 
        SET status = 'CLAIMED', claimed_by = :claimed_by, claimed_at = :claimed_at, updated_at = :updated_at 
        WHERE id = :id AND status = 'AVAILABLE'
    ");
    $updateStmt->execute([
        ':claimed_by' => $user['id'],
        ':claimed_at' => $nowFormatted,
        ':updated_at' => $nowFormatted,
        ':id' => $donationId
    ]);

    if ($updateStmt->rowCount() === 0) {
        $db->rollBack();
        jsonResponse(false, 'Race condition: This donation was just claimed by another organization.', null, 409);
    }

    // Insert claim record
    $claimStmt = $db->prepare("
        INSERT INTO donation_claims (donation_id, ngo_id, claim_status, notes)
        VALUES (:did, :ngo_id, 'ACTIVE', :notes)
    ");
    $claimStmt->execute([
        ':did' => $donationId,
        ':ngo_id' => $user['id'],
        ':notes' => $notes
    ]);

    // Fetch NGO name
    $ngoName = $user['name'];
    if (!empty($user['ngo_profile']['ngo_name'])) {
        $ngoName = $user['ngo_profile']['ngo_name'];
    }

    // Notify Donor
    $donorNotif = $db->prepare("
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES (:uid, :title, :msg, 'DONATION_CLAIMED', :did)
    ");
    $donorNotif->execute([
        ':uid' => $donation['donor_id'],
        ':title' => 'Your Donation Has Been Claimed!',
        ':msg' => "{$ngoName} has claimed your donation \"{$donation['food_name']}\". They will schedule pickup shortly.",
        ':did' => $donationId
    ]);

    // Notify NGO
    $ngoNotif = $db->prepare("
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES (:uid, :title, :msg, 'ALERT', :did)
    ");
    $ngoNotif->execute([
        ':uid' => $user['id'],
        ':title' => 'Donation Successfully Claimed',
        ':msg' => "You claimed \"{$donation['food_name']}\". Please schedule your pickup time slot now.",
        ':did' => $donationId
    ]);

    $db->commit();

    jsonResponse(true, 'Donation claimed successfully! Please schedule pickup.', [
        'donation_id' => $donationId,
        'status' => 'CLAIMED',
        'claimed_at' => $nowFormatted
    ]);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    jsonResponse(false, 'Claim failed: ' . $e->getMessage(), null, 500);
}
