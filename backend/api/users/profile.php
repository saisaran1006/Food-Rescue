<?php
// User Profile API Endpoint (Get & Update)
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

$user = AuthMiddleware::requireAuth();
$db = Database::getConnection();

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    jsonResponse(true, 'Profile retrieved', ['user' => $user]);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    $name = trim($input['name'] ?? $user['name']);
    $phone = trim($input['phone'] ?? $user['phone']);
    $address = trim($input['address'] ?? $user['address']);
    $city = trim($input['city'] ?? $user['city']);
    $latitude = !empty($input['latitude']) ? floatval($input['latitude']) : floatval($user['latitude']);
    $longitude = !empty($input['longitude']) ? floatval($input['longitude']) : floatval($user['longitude']);

    if (empty($name) || empty($phone) || empty($address) || empty($city)) {
        jsonResponse(false, 'Name, phone, address, and city cannot be empty.', null, 422);
    }

    try {
        $db->beginTransaction();

        $uStmt = $db->prepare("
            UPDATE users 
            SET name = :name, phone = :phone, address = :address, city = :city,
                latitude = :lat, longitude = :lng, updated_at = CURRENT_TIMESTAMP
            WHERE id = :id
        ");
        $uStmt->execute([
            ':name' => $name,
            ':phone' => $phone,
            ':address' => $address,
            ':city' => $city,
            ':lat' => $latitude,
            ':lng' => $longitude,
            ':id' => $user['id']
        ]);

        if ($user['role'] === 'DONOR') {
            $orgName = trim($input['organization_name'] ?? ($user['donor_profile']['organization_name'] ?? $name));
            $donorType = trim($input['donor_type'] ?? ($user['donor_profile']['donor_type'] ?? 'Restaurant'));
            $fssai = trim($input['fssai_license'] ?? ($user['donor_profile']['fssai_license'] ?? ''));
            $contactPerson = trim($input['contact_person'] ?? ($user['donor_profile']['contact_person'] ?? $name));
            $hours = trim($input['operating_hours'] ?? ($user['donor_profile']['operating_hours'] ?? '9:00 AM - 10:00 PM'));

            $dStmt = $db->prepare("
                UPDATE donor_profiles 
                SET organization_name = :org, donor_type = :type, fssai_license = :fssai,
                    contact_person = :contact, operating_hours = :hours
                WHERE user_id = :uid
            ");
            $dStmt->execute([
                ':org' => $orgName,
                ':type' => $donorType,
                ':fssai' => $fssai,
                ':contact' => $contactPerson,
                ':hours' => $hours,
                ':uid' => $user['id']
            ]);
        } elseif ($user['role'] === 'NGO') {
            $ngoName = trim($input['ngo_name'] ?? ($user['ngo_profile']['ngo_name'] ?? $name));
            $regNumber = trim($input['registration_number'] ?? ($user['ngo_profile']['registration_number'] ?? ''));
            $accepted = $input['accepted_categories'] ?? ($user['ngo_profile']['accepted_categories'] ?? 'Cooked Meals');
            if (is_array($accepted)) {
                $accepted = implode(',', $accepted);
            }
            $capacity = intval($input['serving_capacity'] ?? ($user['ngo_profile']['serving_capacity'] ?? 100));
            $vehicle = trim($input['vehicle_type'] ?? ($user['ngo_profile']['vehicle_type'] ?? 'Van'));

            $nStmt = $db->prepare("
                UPDATE ngo_profiles 
                SET ngo_name = :ngo, registration_number = :reg, accepted_categories = :cats,
                    serving_capacity = :cap, vehicle_type = :vehicle
                WHERE user_id = :uid
            ");
            $nStmt->execute([
                ':ngo' => $ngoName,
                ':reg' => $regNumber,
                ':cats' => $accepted,
                ':cap' => $capacity,
                ':vehicle' => $vehicle,
                ':uid' => $user['id']
            ]);
        }

        $db->commit();
        $updatedUser = AuthMiddleware::getAuthenticatedUser();
        jsonResponse(true, 'Profile updated successfully!', ['user' => $updatedUser]);
    } catch (Exception $e) {
        if ($db->inTransaction()) {
            $db->rollBack();
        }
        jsonResponse(false, 'Failed to update profile: ' . $e->getMessage(), null, 500);
    }
}
