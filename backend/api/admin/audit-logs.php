<?php
// Admin Audit Logs Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = AuthMiddleware::requireRole(['ADMIN']);
$db = Database::getConnection();

$stmt = $db->query("
    SELECT a.*, u.name as admin_name, u.email as admin_email
    FROM admin_actions a
    JOIN users u ON a.admin_id = u.id
    ORDER BY a.created_at DESC
    LIMIT 100
");
$logs = $stmt->fetchAll();

jsonResponse(true, 'Audit logs retrieved', ['logs' => $logs]);
