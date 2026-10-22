-- FoodRescue - Smart Surplus Food Redistribution Platform
-- MySQL Database Schema
-- Charset: utf8mb4

CREATE DATABASE IF NOT EXISTS `foodrescue` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `foodrescue`;

-- 1. Users Table
DROP TABLE IF EXISTS `admin_actions`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `pickup_records`;
DROP TABLE IF EXISTS `donation_claims`;
DROP TABLE IF EXISTS `donations`;
DROP TABLE IF EXISTS `ngo_profiles`;
DROP TABLE IF EXISTS `donor_profiles`;
DROP TABLE IF EXISTS `food_categories`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `phone` VARCHAR(30) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('DONOR', 'NGO', 'ADMIN') NOT NULL,
  `status` ENUM('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED') DEFAULT 'PENDING',
  `address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `latitude` DECIMAL(10, 7) DEFAULT 19.0760,
  `longitude` DECIMAL(10, 7) DEFAULT 72.8777,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_status` (`status`),
  INDEX `idx_users_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Donor Profiles
CREATE TABLE `donor_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `organization_name` VARCHAR(200) NOT NULL,
  `donor_type` ENUM('Restaurant', 'Hotel', 'Hostel', 'Event Organizer', 'Cafeteria', 'Household', 'Other') NOT NULL,
  `fssai_license` VARCHAR(100) DEFAULT NULL,
  `contact_person` VARCHAR(150) DEFAULT NULL,
  `operating_hours` VARCHAR(100) DEFAULT '9:00 AM - 11:00 PM',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_donor_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. NGO Profiles
CREATE TABLE `ngo_profiles` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL UNIQUE,
  `ngo_name` VARCHAR(200) NOT NULL,
  `registration_number` VARCHAR(100) NOT NULL,
  `accepted_categories` TEXT NOT NULL,
  `serving_capacity` INT NOT NULL DEFAULT 100,
  `vehicle_type` VARCHAR(100) DEFAULT 'Van / Electric Vehicle',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_ngo_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Food Categories
CREATE TABLE `food_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` VARCHAR(255) DEFAULT NULL,
  `storage_temp` VARCHAR(50) DEFAULT 'Ambient / Chilled'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Donations
CREATE TABLE `donations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `donor_id` INT NOT NULL,
  `food_name` VARCHAR(200) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `description` TEXT,
  `quantity` DECIMAL(10, 2) NOT NULL,
  `quantity_unit` VARCHAR(50) NOT NULL DEFAULT 'kg',
  `servings` INT NOT NULL,
  `prep_time` DATETIME NOT NULL,
  `expiry_time` DATETIME NOT NULL,
  `pickup_address` TEXT NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `latitude` DECIMAL(10, 7) NOT NULL,
  `longitude` DECIMAL(10, 7) NOT NULL,
  `is_veg` TINYINT(1) NOT NULL DEFAULT 1,
  `allergens` VARCHAR(255) DEFAULT 'None',
  `packaging_type` VARCHAR(100) DEFAULT 'Clean sealed containers',
  `image_url` VARCHAR(255) DEFAULT NULL,
  `pickup_instructions` TEXT DEFAULT NULL,
  `status` ENUM('AVAILABLE', 'CLAIMED', 'PICKUP_SCHEDULED', 'PICKED_UP', 'COMPLETED', 'CANCELLED', 'EXPIRED') DEFAULT 'AVAILABLE',
  `verification_code` VARCHAR(50) UNIQUE DEFAULT NULL,
  `claimed_by` INT DEFAULT NULL,
  `claimed_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_donations_status` (`status`),
  INDEX `idx_donations_category` (`category`),
  INDEX `idx_donations_city` (`city`),
  INDEX `idx_donations_expiry` (`expiry_time`),
  CONSTRAINT `fk_donation_donor` FOREIGN KEY (`donor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_donation_claimed_by` FOREIGN KEY (`claimed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Donation Claims
CREATE TABLE `donation_claims` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `donation_id` INT NOT NULL,
  `ngo_id` INT NOT NULL,
  `claim_status` ENUM('ACTIVE', 'CANCELLED', 'COMPLETED') DEFAULT 'ACTIVE',
  `claimed_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `notes` TEXT DEFAULT NULL,
  INDEX `idx_claims_ngo` (`ngo_id`),
  CONSTRAINT `fk_claim_donation` FOREIGN KEY (`donation_id`) REFERENCES `donations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_claim_ngo` FOREIGN KEY (`ngo_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Pickup Records
CREATE TABLE `pickup_records` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `donation_id` INT NOT NULL UNIQUE,
  `ngo_id` INT NOT NULL,
  `scheduled_date` DATE NOT NULL,
  `scheduled_time` TIME NOT NULL,
  `contact_person` VARCHAR(150) NOT NULL,
  `contact_phone` VARCHAR(50) NOT NULL,
  `pickup_notes` TEXT DEFAULT NULL,
  `status` ENUM('SCHEDULED', 'ARRIVED', 'VERIFIED', 'PICKED_UP', 'COMPLETED', 'FAILED') DEFAULT 'SCHEDULED',
  `verified_at` DATETIME DEFAULT NULL,
  `completed_at` DATETIME DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pickups_status` (`status`),
  CONSTRAINT `fk_pickup_donation` FOREIGN KEY (`donation_id`) REFERENCES `donations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_pickup_ngo` FOREIGN KEY (`ngo_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Notifications
CREATE TABLE `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `message` TEXT NOT NULL,
  `type` ENUM('DONATION_CLAIMED', 'PICKUP_SCHEDULED', 'PICKUP_VERIFIED', 'DONATION_COMPLETED', 'NEW_DONATION', 'USER_VERIFIED', 'ALERT') DEFAULT 'ALERT',
  `related_id` INT DEFAULT NULL,
  `is_read` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_notifications_user` (`user_id`, `is_read`),
  CONSTRAINT `fk_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Admin Actions (Audit Trail)
CREATE TABLE `admin_actions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_id` INT NOT NULL,
  `action_type` VARCHAR(100) NOT NULL,
  `target_type` VARCHAR(50) NOT NULL,
  `target_id` INT NOT NULL,
  `details` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_admin_action_user` FOREIGN KEY (`admin_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
