<?php
// Admin User Management Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = AuthMiddleware::requireRole(['ADMIN']);
$db = Database::getConnection();

$status = trim($_GET['status'] ?? '');
$role = trim($_GET['role'] ?? '');
$search = trim($_GET['search'] ?? '');

$where = ["u.role != 'ADMIN'"];
$params = [];

if (!empty($status) && $status !== 'ALL') {
    $where[] = "u.status = :status";
    $params[':status'] = $status;
}

if (!empty($role) && $role !== 'ALL') {
    $where[] = "u.role = :role";
    $params[':role'] = $role;
}

if (!empty($search)) {
    $where[] = "(u.name LIKE :search OR u.email LIKE :search OR u.phone LIKE :search OR u.city LIKE :search OR dp.organization_name LIKE :search OR np.ngo_name LIKE :search)";
    $params[':search'] = "%{$search}%";
}

$whereClause = implode(" AND ", $where);

$sql = "
    SELECT 
        u.id, u.name, u.email, u.phone, u.role, u.status, u.address, u.city, u.latitude, u.longitude, u.created_at,
        dp.organization_name, dp.donor_type, dp.fssai_license, dp.contact_person, dp.operating_hours,
        np.ngo_name, np.registration_number, np.accepted_categories, np.serving_capacity, np.vehicle_type
    FROM users u
    LEFT JOIN donor_profiles dp ON u.id = dp.user_id
    LEFT JOIN ngo_profiles np ON u.id = np.user_id
    WHERE {$whereClause}
    ORDER BY 
        CASE WHEN u.status = 'PENDING' THEN 1 ELSE 2 END,
        u.created_at DESC
";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$users = $stmt->fetchAll();

// Counts per status tab
$counts = $db->query("
    SELECT 
        COUNT(*) as total,
        COALESCE(SUM(CASE WHEN status = 'PENDING' THEN 1 ELSE 0 END), 0) as pending,
        COALESCE(SUM(CASE WHEN status = 'VERIFIED' THEN 1 ELSE 0 END), 0) as verified,
        COALESCE(SUM(CASE WHEN status = 'REJECTED' THEN 1 ELSE 0 END), 0) as rejected,
        COALESCE(SUM(CASE WHEN status = 'SUSPENDED' THEN 1 ELSE 0 END), 0) as suspended
    FROM users
    WHERE role != 'ADMIN'
")->fetch();

jsonResponse(true, 'Users retrieved successfully', [
    'users' => $users,
    'counts' => $counts
]);
