<?php
// FoodRescue Authentication Middleware
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../config/database.php';

class AuthMiddleware {
    // Generate secure HMAC-SHA256 Signed Token
    public static function generateToken(array $user): string {
        $header = base64_encode(json_encode(['typ' => 'JWT', 'alg' => 'HS256']));
        $payload = base64_encode(json_encode([
            'id' => $user['id'],
            'email' => $user['email'],
            'role' => $user['role'],
            'name' => $user['name'],
            'status' => $user['status'],
            'exp' => time() + (7 * 24 * 60 * 60) // 7 days expiration
        ]));
        $signature = hash_hmac('sha256', "$header.$payload", APP_SECRET);
        return "$header.$payload.$signature";
    }

    // Verify and decode token
    public static function verifyToken(string $token): ?array {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $signature] = $parts;
        $expectedSignature = hash_hmac('sha256', "$headerB64.$payloadB64", APP_SECRET);

        if (!hash_equals($expectedSignature, $signature)) {
            return null;
        }

        $payload = json_decode(base64_decode($payloadB64), true);
        if (!$payload || !isset($payload['exp']) || $payload['exp'] < time()) {
            return null; // Expired or malformed
        }

        return $payload;
    }

    // Extract Bearer token from request headers
    public static function getBearerToken(): ?string {
        $headers = null;
        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
            $headers = trim($_SERVER['REDIRECT_HTTP_AUTHORIZATION']);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        if (!empty($headers) && preg_match('/Bearer\s(\S+)/i', $headers, $matches)) {
            return $matches[1];
        }

        // Also check ?token= in query string for downloads or dev testing
        if (isset($_GET['token']) && !empty($_GET['token'])) {
            return trim($_GET['token']);
        }

        return null;
    }

    // Get current authenticated user details from DB
    public static function getAuthenticatedUser(): ?array {
        $token = self::getBearerToken();
        if (!$token) {
            return null;
        }

        $decoded = self::verifyToken($token);
        if (!$decoded || !isset($decoded['id'])) {
            return null;
        }

        try {
            $db = Database::getConnection();
            $stmt = $db->prepare("SELECT id, name, email, phone, role, status, address, city, latitude, longitude, created_at FROM users WHERE id = :id LIMIT 1");
            $stmt->execute([':id' => $decoded['id']]);
            $user = $stmt->fetch();

            if (!$user) {
                return null;
            }

            if ($user['status'] === 'SUSPENDED') {
                jsonResponse(false, 'Your account has been suspended. Please contact administrator.', null, 403);
            }

            // Attach profile based on role
            if ($user['role'] === 'DONOR') {
                $pStmt = $db->prepare("SELECT organization_name, donor_type, fssai_license, contact_person, operating_hours FROM donor_profiles WHERE user_id = :uid LIMIT 1");
                $pStmt->execute([':uid' => $user['id']]);
                $user['donor_profile'] = $pStmt->fetch() ?: null;
            } elseif ($user['role'] === 'NGO') {
                $pStmt = $db->prepare("SELECT ngo_name, registration_number, accepted_categories, serving_capacity, vehicle_type FROM ngo_profiles WHERE user_id = :uid LIMIT 1");
                $pStmt->execute([':uid' => $user['id']]);
                $user['ngo_profile'] = $pStmt->fetch() ?: null;
            }

            return $user;
        } catch (Exception $e) {
            return null;
        }
    }

    // Require authentication or exit with 401
    public static function requireAuth(): array {
        $user = self::getAuthenticatedUser();
        if (!$user) {
            jsonResponse(false, 'Unauthorized. Please login to continue.', null, 401);
        }
        return $user;
    }

    // Require specific role or list of roles
    public static function requireRole($allowedRoles): array {
        $user = self::requireAuth();
        if (is_string($allowedRoles)) {
            $allowedRoles = [$allowedRoles];
        }

        if (!in_array($user['role'], $allowedRoles, true)) {
            jsonResponse(false, 'Access forbidden. Your role (' . $user['role'] . ') is not authorized for this action.', null, 403);
        }

        return $user;
    }
}
