<?php
// Admin Analytics & Chart Data Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = AuthMiddleware::requireRole(['ADMIN']);
$db = Database::getConnection();

// 1. Food Category Distribution
$catDistribution = $db->query("
    SELECT category, COUNT(*) as count, SUM(servings) as total_servings, SUM(quantity) as total_kg
    FROM donations
    GROUP BY category
    ORDER BY count DESC
")->fetchAll();

// 2. Status Breakdown (Completed vs Cancelled vs Expired vs Active)
$statusBreakdown = $db->query("
    SELECT status, COUNT(*) as count
    FROM donations
    GROUP BY status
")->fetchAll();

// 3. Top Donors by Activity
$topDonors = $db->query("
    SELECT 
        u.id,
        COALESCE(dp.organization_name, u.name) as name,
        dp.donor_type,
        u.city,
        COUNT(d.id) as donation_count,
        COALESCE(SUM(CASE WHEN d.status = 'COMPLETED' THEN d.servings ELSE 0 END), 0) as meals_rescued
    FROM users u
    JOIN donations d ON u.id = d.donor_id
    LEFT JOIN donor_profiles dp ON u.id = dp.user_id
    WHERE u.role = 'DONOR'
    GROUP BY u.id
    ORDER BY donation_count DESC
    LIMIT 6
")->fetchAll();

// 4. Top NGOs by Claims & Pickups
$topNgos = $db->query("
    SELECT 
        u.id,
        COALESCE(np.ngo_name, u.name) as name,
        u.city,
        COUNT(d.id) as claimed_count,
        COALESCE(SUM(CASE WHEN d.status = 'COMPLETED' THEN d.servings ELSE 0 END), 0) as meals_distributed
    FROM users u
    JOIN donations d ON u.id = d.claimed_by
    LEFT JOIN ngo_profiles np ON u.id = np.user_id
    WHERE u.role = 'NGO'
    GROUP BY u.id
    ORDER BY claimed_count DESC
    LIMIT 6
")->fetchAll();

// 5. City/Location Distribution
$cityDistribution = $db->query("
    SELECT city, COUNT(*) as count, SUM(servings) as total_servings
    FROM donations
    GROUP BY city
    ORDER BY count DESC
")->fetchAll();

// 6. Monthly Donations (Sample trend breakdown)
$monthlyTrend = [
    ['month' => 'May', 'donations' => 12, 'rescued' => 310],
    ['month' => 'Jun', 'donations' => 19, 'rescued' => 540],
    ['month' => 'Jul', 'donations' => 24, 'rescued' => 720],
    ['month' => 'Aug', 'donations' => 31, 'rescued' => 980],
    ['month' => 'Sep', 'donations' => 38, 'rescued' => 1150],
    ['month' => 'Oct (Current)', 'donations' => 45, 'rescued' => 1420],
];

jsonResponse(true, 'Analytics data retrieved', [
    'categories' => $catDistribution,
    'status_breakdown' => $statusBreakdown,
    'top_donors' => $topDonors,
    'top_ngos' => $topNgos,
    'city_distribution' => $cityDistribution,
    'monthly_trend' => $monthlyTrend
]);
