<?php
// Logout API Endpoint
require_once __DIR__ . '/../../config/cors.php';
require_once __DIR__ . '/../../config/config.php';

// In token-based auth, client discards the token. Server returns success confirmation.
jsonResponse(true, 'Logged out successfully');
