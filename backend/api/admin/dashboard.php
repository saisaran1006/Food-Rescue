<?php
// Admin Dashboard Overview Statistics Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = AuthMiddleware::requireRole(['ADMIN']);
$db = Database::getConnection();

// Donation Stats
$dStats = $db->query("
    SELECT 
        COUNT(*) as total_donations,
        COALESCE(SUM(CASE WHEN status IN ('AVAILABLE', 'CLAIMED', 'PICKUP_SCHEDULED', 'PICKED_UP') THEN 1 ELSE 0 END), 0) as active_donations,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN 1 ELSE 0 END), 0) as completed_donations,
        COALESCE(SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END), 0) as cancelled_donations,
        COALESCE(SUM(CASE WHEN status = 'EXPIRED' THEN 1 ELSE 0 END), 0) as expired_donations,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN quantity ELSE 0 END), 0) as completed_quantity_kg,
        COALESCE(SUM(quantity), 0) as total_quantity_kg,
        COALESCE(SUM(CASE WHEN status = 'COMPLETED' THEN servings ELSE 0 END), 0) as meals_rescued,
        COALESCE(SUM(servings), 0) as total_servings
    FROM donations
")->fetch();

// User Stats
$uStats = $db->query("
    SELECT 
        COUNT(*) as total_users,
        COALESCE(SUM(CASE WHEN role = 'DONOR' THEN 1 ELSE 0 END), 0) as total_donors,
        COALESCE(SUM(CASE WHEN role = 'NGO' THEN 1 ELSE 0 END), 0) as total_ngos,
        COALESCE(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0) as pending_verifications,
        COALESCE(SUM(CASE WHEN status = 'VERIFIED' THEN 1 ELSE 0 END), 0) as verified_users,
        COALESCE(SUM(CASE WHEN status = 'SUSPENDED' THEN 1 ELSE 0 END), 0) as suspended_users
    FROM users
    WHERE role != 'ADMIN'
")->fetch();

// Recent Activities / Audit Trail
$recentActions = $db->query("
    SELECT a.*, u.name as admin_name 
    FROM admin_actions a 
    JOIN users u ON a.admin_id = u.id 
    ORDER BY a.created_at DESC 
    LIMIT 10
")->fetchAll();

jsonResponse(true, 'Admin dashboard statistics retrieved', [
    'donations' => $dStats,
    'users' => $uStats,
    'recent_actions' => $recentActions
]);
