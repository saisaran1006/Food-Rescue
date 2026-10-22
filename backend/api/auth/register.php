<?php
// Register API Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed', null, 405);
}

$input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

$name = trim($input['name'] ?? '');
$email = strtolower(trim($input['email'] ?? ''));
$phone = trim($input['phone'] ?? '');
$password = $input['password'] ?? '';
$address = trim($input['address'] ?? '');
$city = trim($input['city'] ?? '');
$role = strtoupper(trim($input['role'] ?? $input['user_type'] ?? ''));
$latitude = !empty($input['latitude']) ? floatval($input['latitude']) : 19.0760;
$longitude = !empty($input['longitude']) ? floatval($input['longitude']) : 72.8777;

// Validation
if (empty($name) || empty($email) || empty($phone) || empty($password) || empty($address) || empty($city) || empty($role)) {
    jsonResponse(false, 'Please fill in all required fields.', null, 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    jsonResponse(false, 'Please provide a valid email address.', null, 422);
}

if (strlen($password) < 6) {
    jsonResponse(false, 'Password must be at least 6 characters long.', null, 422);
}

if (!in_array($role, ['DONOR', 'NGO'])) {
    jsonResponse(false, 'Invalid role. Only DONOR or NGO accounts can be created.', null, 422);
}

$db = Database::getConnection();

// Check if email already exists
$checkStmt = $db->prepare("SELECT id FROM users WHERE email = :email LIMIT 1");
$checkStmt->execute([':email' => $email]);
if ($checkStmt->fetch()) {
    jsonResponse(false, 'An account with this email address already exists.', null, 409);
}

$passwordHash = password_hash($password, PASSWORD_BCRYPT);
$status = 'PENDING'; // Awaits admin verification

try {
    $db->beginTransaction();

    // Insert user
    $userStmt = $db->prepare("
        INSERT INTO users (name, email, phone, password_hash, role, status, address, city, latitude, longitude)
        VALUES (:name, :email, :phone, :hash, :role, :status, :address, :city, :lat, :lng)
    ");
    $userStmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':phone' => $phone,
        ':hash' => $passwordHash,
        ':role' => $role,
        ':status' => $status,
        ':address' => $address,
        ':city' => $city,
        ':lat' => $latitude,
        ':lng' => $longitude
    ]);

    $userId = (int)$db->lastInsertId();

    if ($role === 'DONOR') {
        $orgName = trim($input['organization_name'] ?? $name);
        $donorType = trim($input['donor_type'] ?? 'Restaurant');
        $validDonorTypes = ['Restaurant', 'Hotel', 'Hostel', 'Event Organizer', 'Cafeteria', 'Household', 'Other'];
        if (!in_array($donorType, $validDonorTypes)) {
            $donorType = 'Other';
        }
        $fssai = trim($input['fssai_license'] ?? '');
        $contactPerson = trim($input['contact_person'] ?? $name);
        $operatingHours = trim($input['operating_hours'] ?? '9:00 AM - 10:00 PM');

        $dStmt = $db->prepare("
            INSERT INTO donor_profiles (user_id, organization_name, donor_type, fssai_license, contact_person, operating_hours)
            VALUES (:uid, :org, :type, :fssai, :contact, :hours)
        ");
        $dStmt->execute([
            ':uid' => $userId,
            ':org' => $orgName,
            ':type' => $donorType,
            ':fssai' => $fssai,
            ':contact' => $contactPerson,
            ':hours' => $operatingHours
        ]);
    } elseif ($role === 'NGO') {
        $ngoName = trim($input['ngo_name'] ?? $name);
        $regNumber = trim($input['registration_number'] ?? 'REG-' . rand(10000, 99999));
        $acceptedCategories = $input['accepted_categories'] ?? 'Cooked Meals,Rice,Bread,Fruits';
        if (is_array($acceptedCategories)) {
            $acceptedCategories = implode(',', $acceptedCategories);
        }
        $capacity = max(10, (int)($input['serving_capacity'] ?? 100));
        $vehicleType = trim($input['vehicle_type'] ?? 'Van / Utility Vehicle');

        $nStmt = $db->prepare("
            INSERT INTO ngo_profiles (user_id, ngo_name, registration_number, accepted_categories, serving_capacity, vehicle_type)
            VALUES (:uid, :ngo, :reg, :cats, :cap, :vehicle)
        ");
        $nStmt->execute([
            ':uid' => $userId,
            ':ngo' => $ngoName,
            ':reg' => $regNumber,
            ':cats' => $acceptedCategories,
            ':cap' => $capacity,
            ':vehicle' => $vehicleType
        ]);
    }

    // Create admin notification
    $adminStmt = $db->prepare("
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES (1, :title, :msg, 'ALERT', :uid)
    ");
    $adminStmt->execute([
        ':title' => "New {$role} Registration",
        ':msg' => "{$name} ({$email}) registered as {$role} in {$city} and requires verification.",
        ':uid' => $userId
    ]);

    $db->commit();

    $userData = [
        'id' => $userId,
        'name' => $name,
        'email' => $email,
        'phone' => $phone,
        'role' => $role,
        'status' => $status,
        'address' => $address,
        'city' => $city,
        'latitude' => $latitude,
        'longitude' => $longitude
    ];
    $token = AuthMiddleware::generateToken($userData);

    jsonResponse(true, 'Registration successful! Your account is submitted for verification.', [
        'user' => $userData,
        'token' => $token
    ], 201);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    jsonResponse(false, 'Registration failed: ' . $e->getMessage(), null, 500);
}
