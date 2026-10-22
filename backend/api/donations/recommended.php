<?php
// Smart Donation Matching Engine (Rule-Based Compatibility Algorithm)
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = AuthMiddleware::requireAuth();

// Get NGO details (if caller is NGO, use their profile; if admin, allow test NGO selection)
$db = Database::getConnection();

$ngoId = $user['id'];
$ngoProfile = $user['ngo_profile'] ?? null;

if ($user['role'] !== 'NGO') {
    // If Admin or testing, pick first verified NGO
    $testStmt = $db->query("SELECT u.*, np.accepted_categories, np.serving_capacity, np.ngo_name FROM users u JOIN ngo_profiles np ON u.id = np.user_id WHERE u.role = 'NGO' LIMIT 1");
    $testNgo = $testStmt->fetch();
    if ($testNgo) {
        $ngoId = $testNgo['id'];
        $ngoProfile = [
            'ngo_name' => $testNgo['ngo_name'],
            'accepted_categories' => $testNgo['accepted_categories'],
            'serving_capacity' => $testNgo['serving_capacity']
        ];
        $user['latitude'] = $testNgo['latitude'];
        $user['longitude'] = $testNgo['longitude'];
        $user['city'] = $testNgo['city'];
    }
}

$acceptedCats = [];
if ($ngoProfile && !empty($ngoProfile['accepted_categories'])) {
    $acceptedCats = array_map('trim', explode(',', strtolower($ngoProfile['accepted_categories'])));
}
$servingCapacity = $ngoProfile ? intval($ngoProfile['serving_capacity'] ?? 200) : 200;
$ngoLat = floatval($user['latitude'] ?? 19.0760);
$ngoLng = floatval($user['longitude'] ?? 72.8777);

// Fetch all AVAILABLE donations
$sql = "
    SELECT 
        d.*,
        u.name as donor_name,
        u.phone as donor_phone,
        u.email as donor_email,
        u.status as donor_verification_status,
        dp.organization_name,
        dp.donor_type,
        dp.fssai_license
    FROM donations d
    JOIN users u ON d.donor_id = u.id
    LEFT JOIN donor_profiles dp ON u.id = dp.user_id
    WHERE d.status = 'AVAILABLE'
";

$stmt = $db->query($sql);
$donations = $stmt->fetchAll();

$recommendations = [];

foreach ($donations as $item) {
    $urgency = calculateUrgency($item['expiry_time']);
    if ($urgency === 'EXPIRED') {
        continue; // Skip expired
    }

    $dist = calculateDistance($ngoLat, $ngoLng, floatval($item['latitude']), floatval($item['longitude']));
    $item['distance_km'] = $dist;
    $item['urgency'] = $urgency;

    $score = 0;
    $reasons = [];

    // 1. Distance Suitability (0 - 30 pts)
    if ($dist <= 3.0) {
        $score += 30;
        $reasons[] = "is located just {$dist} km away";
    } elseif ($dist <= 7.0) {
        $score += 25;
        $reasons[] = "is located within {$dist} km";
    } elseif ($dist <= 15.0) {
        $score += 15;
        $reasons[] = "is {$dist} km away within transit radius";
    } else {
        $score += 5;
    }

    // 2. Category Compatibility (0 - 30 pts)
    $catLower = strtolower(trim($item['category']));
    $categoryMatches = false;
    foreach ($acceptedCats as $ac) {
        if (strpos($catLower, $ac) !== false || strpos($ac, $catLower) !== false) {
            $categoryMatches = true;
            break;
        }
    }

    if ($categoryMatches || empty($acceptedCats)) {
        $score += 30;
        $reasons[] = "matches your accepted food categories ({$item['category']})";
    } else {
        $score += 8;
    }

    // 3. Serving Capacity Compatibility (0 - 20 pts)
    $servings = intval($item['servings']);
    if ($servings <= $servingCapacity) {
        $score += 20;
        $reasons[] = "fits your handling capacity of {$servingCapacity} meals ({$servings} servings)";
    } else {
        // Exceeds capacity
        $score += 8;
        $reasons[] = "has high volume ({$servings} servings) suitable for combined distribution";
    }

    // 4. Food Urgency Priority (0 - 15 pts)
    if ($urgency === 'CRITICAL') {
        $score += 15;
        $reasons[] = "has critical consumption deadline (< 2 hours remaining)";
    } elseif ($urgency === 'URGENT') {
        $score += 12;
        $reasons[] = "is urgent (consume within 2-6 hours)";
    } elseif ($urgency === 'SOON') {
        $score += 8;
    } else {
        $score += 5;
    }

    // 5. Pickup Availability (0 - 5 pts)
    $score += 5; // Ready for immediate pickup arrangement

    $item['match_score'] = min(100, $score);
    $item['is_recommended'] = ($score >= 65);

    // Human-readable explanation
    if (!empty($reasons)) {
        $item['recommendation_reason'] = "Recommended because this donation " . implode(", ", $reasons) . ".";
    } else {
        $item['recommendation_reason'] = "Available donation within distribution jurisdiction.";
    }

    $recommendations[] = $item;
}

// Sort by match_score descending, then urgency
usort($recommendations, function ($a, $b) {
    if ($b['match_score'] === $a['match_score']) {
        return strcmp($a['expiry_time'], $b['expiry_time']);
    }
    return $b['match_score'] <=> $a['match_score'];
});

jsonResponse(true, 'Smart recommendations retrieved successfully', [
    'recommendations' => $recommendations,
    'ngo_context' => [
        'serving_capacity' => $servingCapacity,
        'accepted_categories' => $acceptedCats,
        'total_evaluated' => count($donations),
        'high_match_count' => count(array_filter($recommendations, fn($r) => $r['is_recommended']))
    ]
]);
