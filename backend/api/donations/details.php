<?php
// Donation Details Endpoint with Complete Timeline
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$id = intval($_GET['id'] ?? 0);
if ($id <= 0) {
    jsonResponse(false, 'Invalid donation ID.', null, 400);
}

$user = AuthMiddleware::getAuthenticatedUser();
$db = Database::getConnection();

$sql = "
    SELECT 
        d.*,
        u.name as donor_name,
        u.phone as donor_phone,
        u.email as donor_email,
        u.status as donor_verification_status,
        dp.organization_name,
        dp.donor_type,
        dp.fssai_license,
        dp.operating_hours,
        c_user.name as claimed_by_ngo_name,
        c_user.phone as claimed_by_ngo_phone,
        c_user.email as claimed_by_ngo_email,
        np.ngo_name,
        np.registration_number as ngo_reg_number,
        np.vehicle_type as ngo_vehicle_type,
        pr.id as pickup_id,
        pr.scheduled_date,
        pr.scheduled_time,
        pr.contact_person as pickup_contact_person,
        pr.contact_phone as pickup_contact_phone,
        pr.pickup_notes,
        pr.status as pickup_status,
        pr.verified_at as pickup_verified_at,
        pr.completed_at as pickup_completed_at
    FROM donations d
    JOIN users u ON d.donor_id = u.id
    LEFT JOIN donor_profiles dp ON u.id = dp.user_id
    LEFT JOIN users c_user ON d.claimed_by = c_user.id
    LEFT JOIN ngo_profiles np ON c_user.id = np.user_id
    LEFT JOIN pickup_records pr ON d.id = pr.donation_id
    WHERE d.id = :id
    LIMIT 1
";

$stmt = $db->prepare($sql);
$stmt->execute([':id' => $id]);
$donation = $stmt->fetch();

if (!$donation) {
    jsonResponse(false, 'Donation not found.', null, 404);
}

$donation['urgency'] = calculateUrgency($donation['expiry_time']);

if ($user && !empty($user['latitude']) && !empty($user['longitude'])) {
    $donation['distance_km'] = calculateDistance(
        floatval($user['latitude']),
        floatval($user['longitude']),
        floatval($donation['latitude']),
        floatval($donation['longitude'])
    );
}

// Generate Timeline Steps
$timeline = [
    [
        'step' => 'POSTED',
        'title' => 'Donation Posted',
        'description' => 'Surplus food posted by ' . ($donation['organization_name'] ?: $donation['donor_name']),
        'timestamp' => $donation['created_at'],
        'completed' => true
    ],
    [
        'step' => 'CLAIMED',
        'title' => 'Claimed by NGO',
        'description' => $donation['claimed_by_ngo_name'] ? "Claimed by {$donation['claimed_by_ngo_name']}" : "Awaiting eligible NGO",
        'timestamp' => $donation['claimed_at'],
        'completed' => in_array($donation['status'], ['CLAIMED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'COMPLETED'])
    ],
    [
        'step' => 'PICKUP_SCHEDULED',
        'title' => 'Pickup Scheduled',
        'description' => $donation['scheduled_date'] ? "Scheduled for {$donation['scheduled_date']} at {$donation['scheduled_time']}" : "Pickup date/time not yet scheduled",
        'timestamp' => $donation['scheduled_date'] ? "{$donation['scheduled_date']} {$donation['scheduled_time']}" : null,
        'completed' => in_array($donation['status'], ['PICKUP_SCHEDULED', 'PICKED_UP', 'COMPLETED'])
    ],
    [
        'step' => 'PICKED_UP',
        'title' => 'Picked Up (QR Verified)',
        'description' => $donation['pickup_verified_at'] ? "Verified via digital handover at {$donation['pickup_verified_at']}" : "Awaiting physical pickup and QR handover verification",
        'timestamp' => $donation['pickup_verified_at'],
        'completed' => in_array($donation['status'], ['PICKED_UP', 'COMPLETED'])
    ],
    [
        'step' => 'COMPLETED',
        'title' => 'Donation Completed',
        'description' => in_array($donation['status'], ['COMPLETED']) ? "Food distributed and meals rescued successfully" : "Pending final distribution",
        'timestamp' => $donation['pickup_completed_at'] ?: ($donation['status'] === 'COMPLETED' ? $donation['updated_at'] : null),
        'completed' => ($donation['status'] === 'COMPLETED')
    ]
];

$donation['timeline'] = $timeline;

jsonResponse(true, 'Donation details retrieved successfully', [
    'donation' => $donation
]);
