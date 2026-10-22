<?php
// QR Code Handover Verification Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed', null, 405);
}

$user = AuthMiddleware::requireRole(['NGO', 'DONOR', 'ADMIN']);
$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$verificationCode = strtoupper(trim($input['verification_code'] ?? ''));
$donationId = intval($input['donation_id'] ?? 0);

if (empty($verificationCode)) {
    jsonResponse(false, 'Verification code is required.', null, 422);
}

$db = Database::getConnection();

// Locate donation by code and optional ID
if ($donationId > 0) {
    $stmt = $db->prepare("SELECT * FROM donations WHERE id = :id AND verification_code = :code LIMIT 1");
    $stmt->execute([':id' => $donationId, ':code' => $verificationCode]);
} else {
    $stmt = $db->prepare("SELECT * FROM donations WHERE verification_code = :code LIMIT 1");
    $stmt->execute([':code' => $verificationCode]);
}

$donation = $stmt->fetch();

if (!$donation) {
    jsonResponse(false, 'Invalid verification code! Please verify the QR code and try again.', null, 404);
}

// Check authorization (if NGO, must be the claiming NGO or Admin)
if ($user['role'] === 'NGO' && $donation['claimed_by'] != $user['id']) {
    jsonResponse(false, 'This donation code belongs to another assigned organization.', null, 403);
}

// Check state
if ($donation['status'] === 'PICKED_UP' || $donation['status'] === 'COMPLETED') {
    jsonResponse(false, 'This verification code has already been successfully verified and processed.', null, 409);
}

if ($donation['status'] === 'CANCELLED' || $donation['status'] === 'EXPIRED') {
    jsonResponse(false, "Cannot verify handover. Donation status is '{$donation['status']}'.", null, 400);
}

try {
    $db->beginTransaction();

    $nowFormatted = date('Y-m-d H:i:s');

    // Update donation status to PICKED_UP
    $uStmt = $db->prepare("UPDATE donations SET status = 'PICKED_UP', updated_at = :now WHERE id = :id");
    $uStmt->execute([':now' => $nowFormatted, ':id' => $donation['id']]);

    // Update or create pickup record
    $pCheck = $db->prepare("SELECT id FROM pickup_records WHERE donation_id = :did LIMIT 1");
    $pCheck->execute([':did' => $donation['id']]);
    $pickup = $pCheck->fetch();

    if ($pickup) {
        $prStmt = $db->prepare("UPDATE pickup_records SET status = 'PICKED_UP', verified_at = :now, updated_at = :now WHERE donation_id = :did");
        $prStmt->execute([':now' => $nowFormatted, ':did' => $donation['id']]);
    } else {
        $prStmt = $db->prepare("
            INSERT INTO pickup_records (donation_id, ngo_id, scheduled_date, scheduled_time, contact_person, contact_phone, status, verified_at)
            VALUES (:did, :ngo_id, :sdate, :stime, :cperson, :cphone, 'PICKED_UP', :now)
        ");
        $prStmt->execute([
            ':did' => $donation['id'],
            ':ngo_id' => $donation['claimed_by'] ?: $user['id'],
            ':sdate' => date('Y-m-d'),
            ':stime' => date('H:i:s'),
            ':cperson' => $user['name'],
            ':cphone' => $user['phone'],
            ':now' => $nowFormatted
        ]);
    }

    // Notify Donor
    $donorNotif = $db->prepare("
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES (:uid, 'Handover Verified!', :msg, 'PICKUP_VERIFIED', :did)
    ");
    $donorNotif->execute([
        ':uid' => $donation['donor_id'],
        ':msg' => "QR Code verified! \"{$donation['food_name']}\" ({$donation['servings']} servings) has been handed over safely.",
        ':did' => $donation['id']
    ]);

    // Notify NGO
    if ($donation['claimed_by']) {
        $ngoNotif = $db->prepare("
            INSERT INTO notifications (user_id, title, message, type, related_id)
            VALUES (:uid, 'Pickup Verified Successfully', :msg, 'PICKUP_VERIFIED', :did)
        ");
        $ngoNotif->execute([
            ':uid' => $donation['claimed_by'],
            ':msg' => "Donation #{$donation['id']} \"{$donation['food_name']}\" handover verified. Status is now PICKED_UP.",
            ':did' => $donation['id']
        ]);
    }

    $db->commit();

    jsonResponse(true, 'Handover verified successfully! Donation marked as PICKED UP.', [
        'donation_id' => $donation['id'],
        'food_name' => $donation['food_name'],
        'servings' => $donation['servings'],
        'quantity' => $donation['quantity'],
        'unit' => $donation['quantity_unit'],
        'status' => 'PICKED_UP',
        'verified_at' => $nowFormatted
    ]);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    jsonResponse(false, 'Verification failed: ' . $e->getMessage(), null, 500);
}
