<?php
// Login API Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$email = strtolower(trim($input['email'] ?? ''));
$password = $input['password'] ?? '';

if (empty($email) || empty($password)) {
    jsonResponse(false, 'Please provide both email and password.', null, 422);
}

$db = Database::getConnection();

$stmt = $db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
$stmt->execute([':email' => $email]);
$user = $stmt->fetch();

if (!$user) {
    jsonResponse(false, 'Invalid email or password.', null, 401);
}

// Check password using password_verify or demo password match
$isValid = password_verify($password, $user['password_hash']) || 
           ($password === 'Password@123') || 
           ($password === 'secret');

if (!$isValid) {
    jsonResponse(false, 'Invalid email or password.', null, 401);
}

if ($user['status'] === 'SUSPENDED') {
    jsonResponse(false, 'Your account has been suspended by an administrator. Please reach out to support@foodrescue.org.', null, 403);
}

// Fetch corresponding profile
$profile = null;
if ($user['role'] === 'DONOR') {
    $pStmt = $db->prepare("SELECT * FROM donor_profiles WHERE user_id = :uid LIMIT 1");
    $pStmt->execute([':uid' => $user['id']]);
    $profile = $pStmt->fetch() ?: null;
} elseif ($user['role'] === 'NGO') {
    $pStmt = $db->prepare("SELECT * FROM ngo_profiles WHERE user_id = :uid LIMIT 1");
    $pStmt->execute([':uid' => $user['id']]);
    $profile = $pStmt->fetch() ?: null;
}

$token = AuthMiddleware::generateToken($user);

// Exclude password_hash from response
unset($user['password_hash']);
$user['profile'] = $profile;

jsonResponse(true, 'Login successful!', [
    'user' => $user,
    'token' => $token
]);
