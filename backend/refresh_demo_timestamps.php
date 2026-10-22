<?php
require_once __DIR__ . '/config/database.php';

$db = Database::getConnection();
$now = time();

$updates = [
    1  => ['status' => 'AVAILABLE', 'exp' => $now + 3600 * 2.5,  'prep' => $now - 3600 * 2],
    3  => ['status' => 'AVAILABLE', 'exp' => $now + 3600 * 5,    'prep' => $now - 3600 * 1],
    4  => ['status' => 'AVAILABLE', 'exp' => $now + 3600 * 16,   'prep' => $now - 3600 * 3],
    5  => ['status' => 'AVAILABLE', 'exp' => $now + 3600 * 48,   'prep' => $now - 3600 * 4],
    12 => ['status' => 'AVAILABLE', 'exp' => $now + 3600 * 4,    'prep' => $now - 3600 * 2],
    13 => ['status' => 'AVAILABLE', 'exp' => $now + 3600 * 22,   'prep' => $now - 3600 * 1]
];

foreach ($updates as $id => $u) {
    $stmt = $db->prepare("
        UPDATE donations 
        SET status = :status, 
            expiry_time = :exp, 
            prep_time = :prep, 
            claimed_by = NULL, 
            claimed_at = NULL 
        WHERE id = :id
    ");
    $stmt->execute([
        ':status' => $u['status'],
        ':exp' => date('Y-m-d H:i:s', (int)$u['exp']),
        ':prep' => date('Y-m-d H:i:s', (int)$u['prep']),
        ':id' => $id
    ]);
}

echo "Successfully refreshed timestamps for demo donations 1, 3, 4, 5, 12, 13!\n";
