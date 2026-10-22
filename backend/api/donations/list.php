<?php
// List Donations with Filters, Search, Distance, Pagination, and Urgency Calculation
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = AuthMiddleware::getAuthenticatedUser();

$db = Database::getConnection();

// First, auto-update expired donations
$driver = Database::getDriver();
if ($driver === 'sqlite') {
    $db->exec("UPDATE donations SET status = 'EXPIRED' WHERE status = 'AVAILABLE' AND expiry_time <= datetime('now')");
} else {
    $db->exec("UPDATE donations SET status = 'EXPIRED' WHERE status = 'AVAILABLE' AND expiry_time <= NOW()");
}

// Query parameters
$status = trim($_GET['status'] ?? '');
$category = trim($_GET['category'] ?? '');
$city = trim($_GET['city'] ?? '');
$urgencyFilter = trim($_GET['urgency'] ?? '');
$isVeg = isset($_GET['is_veg']) && $_GET['is_veg'] !== '' ? intval($_GET['is_veg']) : null;
$donorId = isset($_GET['donor_id']) ? intval($_GET['donor_id']) : null;
$claimedBy = isset($_GET['claimed_by']) ? intval($_GET['claimed_by']) : null;
$search = trim($_GET['search'] ?? '');
$page = max(1, intval($_GET['page'] ?? 1));
$limit = min(100, max(1, intval($_GET['limit'] ?? 20)));
$offset = ($page - 1) * $limit;

// User coordinates for distance calculation
$userLat = isset($_GET['lat']) ? floatval($_GET['lat']) : ($user ? floatval($user['latitude']) : null);
$userLng = isset($_GET['lng']) ? floatval($_GET['lng']) : ($user ? floatval($user['longitude']) : null);
$maxDistance = isset($_GET['max_distance']) ? floatval($_GET['max_distance']) : null;

$where = ["1=1"];
$params = [];

if (!empty($status) && $status !== 'ALL') {
    $where[] = "d.status = :status";
    $params[':status'] = $status;
}

if (!empty($category) && $category !== 'ALL') {
    $where[] = "d.category = :category";
    $params[':category'] = $category;
}

if (!empty($city) && $city !== 'ALL') {
    $where[] = "d.city LIKE :city";
    $params[':city'] = "%{$city}%";
}

if ($isVeg !== null) {
    $where[] = "d.is_veg = :is_veg";
    $params[':is_veg'] = $isVeg;
}

if ($donorId !== null) {
    $where[] = "d.donor_id = :donor_id";
    $params[':donor_id'] = $donorId;
}

if ($claimedBy !== null) {
    $where[] = "d.claimed_by = :claimed_by";
    $params[':claimed_by'] = $claimedBy;
}

if (!empty($search)) {
    $where[] = "(d.food_name LIKE :search OR d.description LIKE :search OR d.pickup_address LIKE :search OR u.name LIKE :search OR dp.organization_name LIKE :search)";
    $params[':search'] = "%{$search}%";
}

$whereClause = implode(" AND ", $where);

// Count total matching
$countSql = "
    SELECT COUNT(*) as total
    FROM donations d
    JOIN users u ON d.donor_id = u.id
    LEFT JOIN donor_profiles dp ON u.id = dp.user_id
    WHERE {$whereClause}
";
$countStmt = $db->prepare($countSql);
$countStmt->execute($params);
$totalRecords = (int)$countStmt->fetch()['total'];

// Query donations
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
        c_user.name as claimed_by_ngo_name,
        np.ngo_name,
        pr.status as pickup_status,
        pr.scheduled_date,
        pr.scheduled_time
    FROM donations d
    JOIN users u ON d.donor_id = u.id
    LEFT JOIN donor_profiles dp ON u.id = dp.user_id
    LEFT JOIN users c_user ON d.claimed_by = c_user.id
    LEFT JOIN ngo_profiles np ON c_user.id = np.user_id
    LEFT JOIN pickup_records pr ON d.id = pr.donation_id
    WHERE {$whereClause}
    ORDER BY 
        CASE 
            WHEN d.status = 'AVAILABLE' THEN 1
            WHEN d.status = 'CLAIMED' THEN 2
            WHEN d.status = 'PICKUP_SCHEDULED' THEN 3
            WHEN d.status = 'PICKED_UP' THEN 4
            WHEN d.status = 'COMPLETED' THEN 5
            ELSE 6
        END,
        d.expiry_time ASC,
        d.created_at DESC
";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$donations = $stmt->fetchAll();

// Post-process items: add distance, urgency, and optional distance/urgency filtering
$results = [];
foreach ($donations as $item) {
    $item['urgency'] = calculateUrgency($item['expiry_time']);
    
    // Distance
    if ($userLat && $userLng && !empty($item['latitude']) && !empty($item['longitude'])) {
        $dist = calculateDistance($userLat, $userLng, floatval($item['latitude']), floatval($item['longitude']));
        $item['distance_km'] = $dist;
    } else {
        $item['distance_km'] = null;
    }

    // Filter by urgency if requested
    if (!empty($urgencyFilter) && $urgencyFilter !== 'ALL' && $item['urgency'] !== $urgencyFilter) {
        continue;
    }

    // Filter by max distance if requested
    if ($maxDistance !== null && $item['distance_km'] !== null && $item['distance_km'] > $maxDistance) {
        continue;
    }

    $results[] = $item;
}

// Client-requested pagination slice
$totalFiltered = count($results);
$paginated = array_slice($results, $offset, $limit);

jsonResponse(true, 'Donations retrieved successfully', [
    'donations' => $paginated,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total' => $totalFiltered,
        'total_pages' => ceil($totalFiltered / $limit)
    ]
]);
