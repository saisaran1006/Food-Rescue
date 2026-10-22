<?php
// Schedule Pickup API Endpoint
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
$scheduledDate = trim($input['scheduled_date'] ?? date('Y-m-d'));
$scheduledTime = trim($input['scheduled_time'] ?? date('H:i', strtotime('+1 hour')));
$contactPerson = trim($input['contact_person'] ?? $user['name']);
$contactPhone = trim($input['contact_phone'] ?? $user['phone']);
$pickupNotes = trim($input['pickup_notes'] ?? '');

if ($donationId <= 0 || empty($scheduledDate) || empty($scheduledTime) || empty($contactPerson) || empty($contactPhone)) {
    jsonResponse(false, 'Donation ID, scheduled date, time, contact person, and phone are required.', null, 422);
}

$db = Database::getConnection();

$stmt = $db->prepare("SELECT * FROM donations WHERE id = :id LIMIT 1");
$stmt->execute([':id' => $donationId]);
$donation = $stmt->fetch();

if (!$donation) {
    jsonResponse(false, 'Donation not found.', null, 404);
}

if ($user['role'] !== 'ADMIN' && $donation['claimed_by'] != $user['id']) {
    jsonResponse(false, 'You can only schedule pickup for donations claimed by your organization.', null, 403);
}

if (!in_array($donation['status'], ['CLAIMED', 'PICKUP_SCHEDULED'])) {
    jsonResponse(false, "Cannot schedule pickup. Donation status is '{$donation['status']}'.", null, 400);
}

try {
    $db->beginTransaction();

    // Check if pickup record already exists
    $pCheck = $db->prepare("SELECT id FROM pickup_records WHERE donation_id = :did LIMIT 1");
    $pCheck->execute([':did' => $donationId]);
    $existingPickup = $pCheck->fetch();

    if ($existingPickup) {
        $pStmt = $db->prepare("
            UPDATE pickup_records 
            SET scheduled_date = :sdate, scheduled_time = :stime, contact_person = :cperson,
                contact_phone = :cphone, pickup_notes = :notes, status = 'SCHEDULED', updated_at = CURRENT_TIMESTAMP
            WHERE donation_id = :did
        ");
        $pStmt->execute([
            ':sdate' => $scheduledDate,
            ':stime' => $scheduledTime,
            ':cperson' => $contactPerson,
            ':cphone' => $contactPhone,
            ':notes' => $pickupNotes,
            ':did' => $donationId
        ]);
    } else {
        $pStmt = $db->prepare("
            INSERT INTO pickup_records (donation_id, ngo_id, scheduled_date, scheduled_time, contact_person, contact_phone, pickup_notes, status)
            VALUES (:did, :ngo_id, :sdate, :stime, :cperson, :cphone, :notes, 'SCHEDULED')
        ");
        $pStmt->execute([
            ':did' => $donationId,
            ':ngo_id' => $user['id'],
            ':sdate' => $scheduledDate,
            ':stime' => $scheduledTime,
            ':cperson' => $contactPerson,
            ':cphone' => $contactPhone,
            ':notes' => $pickupNotes
        ]);
    }

    // Update donation status
    $uStmt = $db->prepare("UPDATE donations SET status = 'PICKUP_SCHEDULED', updated_at = CURRENT_TIMESTAMP WHERE id = :id");
    $uStmt->execute([':id' => $donationId]);

    // Notify Donor
    $notifStmt = $db->prepare("
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES (:uid, :title, :msg, 'PICKUP_SCHEDULED', :did)
    ");
    $notifStmt->execute([
        ':uid' => $donation['donor_id'],
        ':title' => 'Pickup Scheduled!',
        ':msg' => "Pickup for \"{$donation['food_name']}\" is scheduled on {$scheduledDate} at {$scheduledTime}. Contact: {$contactPerson} ({$contactPhone}).",
        ':did' => $donationId
    ]);

    $db->commit();

    jsonResponse(true, 'Pickup scheduled successfully!', [
        'donation_id' => $donationId,
        'status' => 'PICKUP_SCHEDULED',
        'scheduled_date' => $scheduledDate,
        'scheduled_time' => $scheduledTime
    ]);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    jsonResponse(false, 'Failed to schedule pickup: ' . $e->getMessage(), null, 500);
}
