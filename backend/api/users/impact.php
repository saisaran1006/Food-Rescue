<?php
// Public & Role-based Food Rescue Impact Metrics Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = AuthMiddleware::getAuthenticatedUser();
$db = Database::getConnection();

// 1. Overall Platform Impact
$platformStatsSql = "
    SELECT 
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN servings ELSE 0 END), 0) as total_meals_rescued,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN quantity ELSE 0 END), 0) as total_food_kg,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) as completed_donations,
        COALESCE(SUM(CASE WHEN status IN ('AVAILABLE', 'CLAIMED', 'PICKUP_SCHEDULED', 'PICKED_UP') THEN 1 ELSE 0 END), 0) as active_donations,
        COALESCE(SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END), 0) as cancelled_donations,
        COALESCE(SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END), 0) as expired_donations,
        COUNT(*) as total_donations
    FROM donations
";
$platformStats = $db->query($platformStatsSql)->fetch();

$usersCountSql = "
    SELECT 
        COUNT(*) as total_users,
        COALESCE(SUM(CASE WHEN role = 'DONOR' THEN 1 ELSE 0 END), 0) as total_donors,
        COALESCE(SUM(CASE WHEN role = 'NGO' THEN 1 ELSE 0 END), 0) as total_ngos
    FROM users
";
$userStats = $db->query($usersCountSql)->fetch();

// Estimated people served and environmental impact
$mealsRescued = (int)($platformStats['total_meals_rescued'] ?? 0);
$foodKg = floatval($platformStats['total_food_kg'] ?? 0);
// Environmental estimate: 1 kg food waste diverted saves approx 2.5 kg CO2e
$co2SavedKg = round($foodKg * 2.5, 1);
// Water footprint estimate: 1 kg food diverted saves approx 1000 litres of embedded water
$waterSavedLitres = round($foodKg * 1000, 0);

$response = [
    'global_impact' => [
        'meals_rescued' => $mealsRescued,
        'food_quantity_kg' => round($foodKg, 1),
        'completed_donations' => (int)$platformStats['completed_donations'],
        'active_donations' => (int)$platformStats['active_donations'],
        'cancelled_donations' => (int)$platformStats['cancelled_donations'],
        'expired_donations' => (int)$platformStats['expired_donations'],
        'total_donations' => (int)$platformStats['total_donations'],
        'total_donors' => (int)$userStats['total_donors'],
        'total_ngos' => (int)$userStats['total_ngos'],
        'people_served_estimate' => $mealsRescued,
        'environmental_estimates' => [
            'co2_saved_kg' => $co2SavedKg,
            'water_saved_litres' => $waterSavedLitres,
            'note' => 'Calculated based on standard FAO & UNEP life cycle assessment estimates.'
        ]
    ]
];

// 2. Donor-specific impact
$donorId = isset($_GET['donor_id']) ? intval($_GET['donor_id']) : ($user && $user['role'] === 'DONOR' ? $user['id'] : null);
if ($donorId) {
    $dStmt = $db->prepare("
        SELECT 
            COUNT(*) as total_donations,
            COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN servings ELSE 0 END), 0) as meals_rescued,
            COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN quantity ELSE 0 END), 0) as food_kg_donated,
            COALESCE(SUM(CASE WHEN status IN ('PICKED_UP', 'COMPLETED') THEN 1 ELSE 0 END), 0) as successful_pickups,
            COALESCE(SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END), 0) as cancelled_count,
            COALESCE(SUM(CASE WHEN status IN ('AVAILABLE', 'CLAIMED', 'PICKUP_SCHEDULED') THEN 1 ELSE 0 END), 0) as active_count
        FROM donations
        WHERE donor_id = :did
    ");
    $dStmt->execute([':did' => $donorId]);
    $response['donor_impact'] = $dStmt->fetch();
}

// 3. NGO-specific impact
$ngoId = isset($_GET['ngo_id']) ? intval($_GET['ngo_id']) : ($user && $user['role'] === 'NGO' ? $user['id'] : null);
if ($ngoId) {
    $nStmt = $db->prepare("
        SELECT 
            COUNT(*) as total_claims,
            COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN servings ELSE 0 END), 0) as meals_received,
            COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN quantity ELSE 0 END), 0) as food_kg_received,
            COALESCE(SUM(CASE WHEN status IN ('PICKED_UP', 'COMPLETED') THEN 1 ELSE 0 END), 0) as successful_pickups,
            COALESCE(SUM(CASE WHEN status IN ('CLAIMED', 'PICKUP_SCHEDULED') THEN 1 ELSE 0 END), 0) as upcoming_pickups
        FROM donations
        WHERE claimed_by = :nid
    ");
    $nStmt->execute([':nid' => $ngoId]);
    $response['ngo_impact'] = $nStmt->fetch();

    // Food categories handled by this NGO
    $catStmt = $db->prepare("
        SELECT category, COUNT(*) as count, SUM(servings) as total_servings
        FROM donations
        WHERE claimed_by = :nid AND status = 'COMPLETED'
        GROUP BY category
    ");
    $catStmt->execute([':nid' => $ngoId]);
    $response['ngo_impact']['categories_handled'] = $catStmt->fetchAll();
}

jsonResponse(true, 'Impact metrics retrieved successfully', $response);
