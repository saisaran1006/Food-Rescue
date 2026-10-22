<?php
// Update Pickup / Completion Status Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed', null, 405);
}

$user = AuthMiddleware::requireRole(['NGO', 'DONOR', 'ADMIN']);
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$donationId = intval($input['donation_id'] ?? 0);
$newStatus = strtoupper(trim($input['status'] ?? ''));

$allowedStatuses = ['ARRIVED', 'COMPLETED'];
if ($donationId <= 0 || !in_array($newStatus, $allowedStatuses)) {
    jsonResponse(false, 'Valid donation ID and status (ARRIVED, COMPLETED) are required.', null, 422);
}

$db = Database::getConnection();

$stmt = $db->prepare("SELECT * FROM donations WHERE id = :id LIMIT 1");
$stmt->execute([':id' => $donationId]);
$donation = $stmt->fetch();

if (!$donation) {
    jsonResponse(false, 'Donation not found.', null, 404);
}

// Authorization
if ($user['role'] !== 'ADMIN' && $donation['claimed_by'] != $user['id'] && $donation['donor_id'] != $user['id']) {
    jsonResponse(false, 'You do not have permission to update this pickup status.', null, 403);
}

$nowFormatted = date('Y-m-d H:i:s');

try {
    $db->beginTransaction();

    if ($newStatus === 'ARRIVED') {
        $pStmt = $db->prepare("UPDATE pickup_records SET status = 'ARRIVED', updated_at = :now WHERE donation_id = :did");
        $pStmt->execute([':now' => $nowFormatted, ':did' => $donationId]);

        // Notify Donor
        $notifStmt = $db->prepare("
            INSERT INTO notifications (user_id, title, message, type, related_id)
            VALUES (:uid, 'Rescue Vehicle Arrived', :msg, 'ALERT', :did)
        ");
        $notifStmt->execute([
            ':uid' => $donation['donor_id'],
            ':msg' => "Rescue team for \"{$donation['food_name']}\" has arrived at pickup location.",
            ':did' => $donationId
        ]);
        
        $msg = 'Pickup vehicle marked as ARRIVED at location.';
    } elseif ($newStatus === 'COMPLETED') {
        // Can only complete if PICKED_UP or Admin override
        if ($user['role'] !== 'ADMIN' && $donation['status'] !== 'PICKED_UP') {
            $db->rollBack();
            jsonResponse(false, 'Donation must be verified and picked up first before marking as COMPLETED.', null, 400);
        }

        $dStmt = $db->prepare("UPDATE donations SET status = 'COMPLETED', updated_at = :now WHERE id = :id");
        $dStmt->execute([':now' => $nowFormatted, ':id' => $donationId]);

        $pStmt = $db->prepare("UPDATE pickup_records SET status = 'COMPLETED', completed_at = :now, updated_at = :now WHERE donation_id = :did");
        $pStmt->execute([':now' => $nowFormatted, ':did' => $donationId]);

        // Update claim record
        $cStmt = $db->prepare("UPDATE donation_claims SET claim_status = 'COMPLETED' WHERE donation_id = :did");
        $cStmt->execute([':did' => $donationId]);

        // Notify Donor
        $notifStmt = $db->prepare("
            INSERT INTO notifications (user_id, title, message, type, related_id)
            VALUES (:uid, 'Donation Completed! 🎉', :msg, 'DONATION_COMPLETED', :did)
        ");
        $notifStmt->execute([
            ':uid' => $donation['donor_id'],
            ':msg' => "Congratulations! Your donation \"{$donation['food_name']}\" was successfully delivered. {$donation['servings']} meals rescued!",
            ':did' => $donationId
        ]);

        $msg = 'Donation marked as COMPLETED! Impact metrics updated.';
    }

    $db->commit();

    jsonResponse(true, $msg, [
        'donation_id' => $donationId,
        'status' => $newStatus === 'COMPLETED' ? 'COMPLETED' : $donation['status'],
        'pickup_status' => $newStatus
    ]);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    jsonResponse(false, 'Status update failed: ' . $e->getMessage(), null, 500);
}
