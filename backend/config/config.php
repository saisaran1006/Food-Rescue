<?php
// FoodRescue Global Configuration & Helper Functions

define('APP_NAME', 'FoodRescue');
define('APP_SECRET', getenv('FR_APP_SECRET') ?: 'FoodRescue_Secure_Secret_Key_2026!#*');
define('UPLOAD_DIR', __DIR__ . '/../uploads/');
define('UPLOAD_URL', '/backend/uploads/');

// Database Configuration
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', getenv('DB_PORT') ?: '3306');
define('DB_NAME', getenv('DB_NAME') ?: 'foodrescue');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// Standard JSON API Response Helper
function jsonResponse($success, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data
    ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

// Generate Unique Handover Verification Code (e.g. FR-MUM-8921)
function generateVerificationCode($prefix = 'FR') {
    $chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    $code = '';
    for ($i = 0; $i < 6; $i++) {
        $code .= $chars[random_int(0, strlen($chars) - 1)];
    }
    return $prefix . '-' . substr($code, 0, 3) . '-' . substr($code, 3, 3);
}

// Calculate Food Urgency Level based on Expiry Time
function calculateUrgency($expiryTime) {
    if (empty($expiryTime)) return 'NORMAL';
    $now = new DateTime();
    $expiry = new DateTime($expiryTime);
    
    if ($expiry <= $now) {
        return 'EXPIRED';
    }
    
    $diffMinutes = ($expiry->getTimestamp() - $now->getTimestamp()) / 60;
    $diffHours = $diffMinutes / 60;
    
    if ($diffHours < 2) {
        return 'CRITICAL'; // Less than 2 hours
    } elseif ($diffHours <= 6) {
        return 'URGENT';   // 2 to 6 hours
    } elseif ($diffHours <= 12) {
        return 'SOON';     // 6 to 12 hours
    } else {
        return 'NORMAL';   // > 12 hours
    }
}

// Haversine Great-Circle Distance Formula between two coordinates in kilometers
function calculateDistance($lat1, $lon1, $lat2, $lon2) {
    if (empty($lat1) || empty($lon1) || empty($lat2) || empty($lon2)) {
        return 0.0;
    }
    $earthRadius = 6371; // km
    
    $dLat = deg2rad($lat2 - $lat1);
    $dLon = deg2rad($lon2 - $lon1);
    
    $a = sin($dLat / 2) * sin($dLat / 2) +
         cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
         sin($dLon / 2) * sin($dLon / 2);
         
    $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
    $distance = $earthRadius * $c;
    
    return round($distance, 1);
}

// Ensure Upload Directory Exists
if (!is_dir(UPLOAD_DIR)) {
    @mkdir(UPLOAD_DIR, 0755, true);
}
