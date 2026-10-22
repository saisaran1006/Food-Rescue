<?php
// Create Surplus Food Donation Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../middleware/auth.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(false, 'Method not allowed', null, 405);
}

// Donor or Admin role required
$user = AuthMiddleware::requireRole(['DONOR', 'ADMIN']);

$foodName = trim($_POST['food_name'] ?? '');
$category = trim($_POST['category'] ?? '');
$description = trim($_POST['description'] ?? '');
$quantity = floatval($_POST['quantity'] ?? 0);
$quantityUnit = trim($_POST['quantity_unit'] ?? 'kg');
$servings = intval($_POST['servings'] ?? 0);
$prepTime = trim($_POST['prep_time'] ?? '');
$expiryTime = trim($_POST['expiry_time'] ?? '');
$pickupAddress = trim($_POST['pickup_address'] ?? $user['address']);
$city = trim($_POST['city'] ?? $user['city']);
$latitude = !empty($_POST['latitude']) ? floatval($_POST['latitude']) : floatval($user['latitude'] ?? 19.0760);
$longitude = !empty($_POST['longitude']) ? floatval($_POST['longitude']) : floatval($user['longitude'] ?? 72.8777);
$isVeg = isset($_POST['is_veg']) ? (intval($_POST['is_veg']) ? 1 : 0) : 1;
$allergens = trim($_POST['allergens'] ?? 'None');
$packagingType = trim($_POST['packaging_type'] ?? 'Clean sealed containers');
$pickupInstructions = trim($_POST['pickup_instructions'] ?? '');
$imageUrl = trim($_POST['image_url'] ?? '');

// If JSON body was provided instead of multipart form data
if (empty($foodName)) {
    $raw = json_decode(file_get_contents('php://input'), true);
    if ($raw) {
        $foodName = trim($raw['food_name'] ?? '');
        $category = trim($raw['category'] ?? '');
        $description = trim($raw['description'] ?? '');
        $quantity = floatval($raw['quantity'] ?? 0);
        $quantityUnit = trim($raw['quantity_unit'] ?? 'kg');
        $servings = intval($raw['servings'] ?? 0);
        $prepTime = trim($raw['prep_time'] ?? '');
        $expiryTime = trim($raw['expiry_time'] ?? '');
        $pickupAddress = trim($raw['pickup_address'] ?? $user['address']);
        $city = trim($raw['city'] ?? $user['city']);
        $latitude = !empty($raw['latitude']) ? floatval($raw['latitude']) : floatval($user['latitude'] ?? 19.0760);
        $longitude = !empty($raw['longitude']) ? floatval($raw['longitude']) : floatval($user['longitude'] ?? 72.8777);
        $isVeg = isset($raw['is_veg']) ? (intval($raw['is_veg']) ? 1 : 0) : 1;
        $allergens = trim($raw['allergens'] ?? 'None');
        $packagingType = trim($raw['packaging_type'] ?? 'Clean sealed containers');
        $pickupInstructions = trim($raw['pickup_instructions'] ?? '');
        $imageUrl = trim($raw['image_url'] ?? '');
    }
}

// Validations
if (empty($foodName) || empty($category) || empty($prepTime) || empty($expiryTime)) {
    jsonResponse(false, 'Food name, category, preparation time, and consumption deadline are required.', null, 422);
}

if ($quantity <= 0) {
    jsonResponse(false, 'Quantity must be greater than zero.', null, 422);
}

if ($servings <= 0) {
    jsonResponse(false, 'Servings count must be greater than zero.', null, 422);
}

// Check dates
$now = new DateTime();
$prepDate = new DateTime($prepTime);
$expiryDate = new DateTime($expiryTime);

if ($expiryDate <= $now) {
    jsonResponse(false, 'Cannot post expired food! Consumption deadline must be in the future.', null, 422);
}

if ($expiryDate <= $prepDate) {
    jsonResponse(false, 'Consumption deadline must be after preparation time.', null, 422);
}

// Handle food image upload if provided
if (isset($_FILES['food_image']) && $_FILES['food_image']['error'] === UPLOAD_ERR_OK) {
    $file = $_FILES['food_image'];
    $allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    $allowedExts = ['jpg', 'jpeg', 'png', 'webp'];
    
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime, $allowedMimes) || !in_array($ext, $allowedExts)) {
        jsonResponse(false, 'Invalid image format. Allowed formats: JPG, PNG, WEBP.', null, 422);
    }

    if ($file['size'] > 5 * 1024 * 1024) {
        jsonResponse(false, 'Image size exceeds maximum limit of 5MB.', null, 422);
    }

    $safeFileName = 'food_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . $ext;
    $targetPath = UPLOAD_DIR . $safeFileName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        $imageUrl = UPLOAD_URL . $safeFileName;
    }
}

// Default fallback image if none provided
if (empty($imageUrl)) {
    $categoryPlaceholders = [
        'Cooked Meals' => 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
        'Rice' => 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=600&auto=format&fit=crop&q=80',
        'Bread' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80',
        'Fruits' => 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
        'Vegetables' => 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        'Bakery' => 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80',
        'Packaged Food' => 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        'Dairy' => 'https://images.unsplash.com/photo-1528732263440-4dd1a18a4cc2?w=600&auto=format&fit=crop&q=80',
        'Other' => 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&auto=format&fit=crop&q=80'
    ];
    $imageUrl = $categoryPlaceholders[$category] ?? $categoryPlaceholders['Cooked Meals'];
}

$cityPrefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $city), 0, 3));
if (strlen($cityPrefix) < 3) $cityPrefix = 'MUM';
$verificationCode = generateVerificationCode('FR-' . $cityPrefix);

$db = Database::getConnection();

try {
    $db->beginTransaction();

    $stmt = $db->prepare("
        INSERT INTO donations (
            donor_id, food_name, category, description, quantity, quantity_unit,
            servings, prep_time, expiry_time, pickup_address, city, latitude, longitude,
            is_veg, allergens, packaging_type, image_url, pickup_instructions,
            status, verification_code
        ) VALUES (
            :donor_id, :food_name, :category, :description, :quantity, :quantity_unit,
            :servings, :prep_time, :expiry_time, :pickup_address, :city, :latitude, :longitude,
            :is_veg, :allergens, :packaging_type, :image_url, :pickup_instructions,
            'AVAILABLE', :verification_code
        )
    ");

    $stmt->execute([
        ':donor_id' => $user['id'],
        ':food_name' => $foodName,
        ':category' => $category,
        ':description' => $description,
        ':quantity' => $quantity,
        ':quantity_unit' => $quantityUnit,
        ':servings' => $servings,
        ':prep_time' => $prepTime,
        ':expiry_time' => $expiryTime,
        ':pickup_address' => $pickupAddress,
        ':city' => $city,
        ':latitude' => $latitude,
        ':longitude' => $longitude,
        ':is_veg' => $isVeg,
        ':allergens' => $allergens,
        ':packaging_type' => $packagingType,
        ':image_url' => $imageUrl,
        ':pickup_instructions' => $pickupInstructions,
        ':verification_code' => $verificationCode
    ]);

    $donationId = (int)$db->lastInsertId();

    // Broadcast notification to nearby NGOs in the same city
    $ngoStmt = $db->prepare("SELECT id FROM users WHERE role = 'NGO' AND city = :city");
    $ngoStmt->execute([':city' => $city]);
    $ngos = $ngoStmt->fetchAll();

    $urgency = calculateUrgency($expiryTime);
    $urgencyBadge = ($urgency === 'CRITICAL' || $urgency === 'URGENT') ? "[URGENT] " : "";

    $notifStmt = $db->prepare("
        INSERT INTO notifications (user_id, title, message, type, related_id)
        VALUES (:uid, :title, :msg, 'NEW_DONATION', :did)
    ");

    foreach ($ngos as $ngo) {
        $notifStmt->execute([
            ':uid' => $ngo['id'],
            ':title' => "{$urgencyBadge}New Surplus Food in {$city}",
            ':msg' => "{$foodName} ({$servings} servings, {$quantity} {$quantityUnit}) has been posted by {$user['name']}.",
            ':did' => $donationId
        ]);
    }

    $db->commit();

    jsonResponse(true, 'Surplus food donation posted successfully!', [
        'id' => $donationId,
        'verification_code' => $verificationCode,
        'urgency' => $urgency,
        'status' => 'AVAILABLE'
    ], 201);
} catch (Exception $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    jsonResponse(false, 'Failed to post donation: ' . $e->getMessage(), null, 500);
}
