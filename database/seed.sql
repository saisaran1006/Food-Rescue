-- FoodRescue Seed Data
-- 1 Admin, 5 Donors, 5 NGOs, Food Categories, 15 Donations, Claims, Pickups, Notifications

USE `foodrescue`;

-- Clean existing data
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE `admin_actions`;
TRUNCATE TABLE `notifications`;
TRUNCATE TABLE `pickup_records`;
TRUNCATE TABLE `donation_claims`;
TRUNCATE TABLE `donations`;
TRUNCATE TABLE `ngo_profiles`;
TRUNCATE TABLE `donor_profiles`;
TRUNCATE TABLE `food_categories`;
TRUNCATE TABLE `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- Default password for all seed accounts is: Password@123
-- Hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi (or matched dynamically)
SET @default_pass = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- 1. Food Categories
INSERT INTO `food_categories` (`id`, `name`, `description`, `storage_temp`) VALUES
(1, 'Cooked Meals', 'Freshly prepared hot curries, biryani, sabzi, daal', 'Warm (>60°C) or rapid chilled'),
(2, 'Rice', 'Cooked basmati, jeera rice, pulao, plain boiled rice', 'Warm or refrigerated'),
(3, 'Bread', 'Rotis, chapatis, naans, parathas, dinner rolls', 'Dry ambient container'),
(4, 'Fruits', 'Fresh seasonal bananas, apples, oranges, papayas', 'Ambient / ventilated'),
(5, 'Vegetables', 'Raw fresh greens, potatoes, onions, tomatoes', 'Cool ambient / refrigerated'),
(6, 'Bakery', 'Breads, muffins, sandwich loaves, buns, croissants', 'Cool dry storage'),
(7, 'Packaged Food', 'Biscuits, packaged fruit juices, snacks, tetra packs', 'Dry ambient shelf'),
(8, 'Dairy', 'Paneer, curd, milk packets, cheese', 'Refrigerated (<4°C)'),
(9, 'Other', 'Dry grains, assorted festive sweets, condiments', 'Ambient storage');

-- 2. Users (1 Admin, 5 Donors, 5 NGOs)
-- Admin
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `status`, `address`, `city`, `latitude`, `longitude`) VALUES
(1, 'System Administrator', 'admin@foodrescue.org', '+91 98200 11000', @default_pass, 'ADMIN', 'VERIFIED', 'BMC Disaster Management Cell, Fort', 'Mumbai', 18.9322, 72.8335);

-- 5 Donors
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `status`, `address`, `city`, `latitude`, `longitude`) VALUES
(2, 'Chef Rajesh Sharma (Annapoorna)', 'annapoorna@gmail.com', '+91 98201 22334', @default_pass, 'DONOR', 'VERIFIED', '14 Shivaji Park Road, Dadar West', 'Mumbai', 19.0280, 72.8397),
(3, 'Priya Merchant (Grand Residency)', 'grandresidency@hotel.com', '+91 98202 33445', @default_pass, 'DONOR', 'VERIFIED', 'Hill Road, Near Bandra Station, Bandra West', 'Mumbai', 19.0596, 72.8295),
(4, 'Prof. Arvind Kulkarni (Green Valley Hostel)', 'hostel@greenvalley.edu', '+91 98203 44556', @default_pass, 'DONOR', 'VERIFIED', 'Hostel Block 4, IIT Powai Campus', 'Mumbai', 19.1254, 72.9157),
(5, 'Sanjay Deshmukh (Spice Garden)', 'spicegarden@restaurant.com', '+91 98204 55667', @default_pass, 'DONOR', 'VERIFIED', 'Link Road, Andheri West', 'Mumbai', 19.1363, 72.8277),
(6, 'Manish Mehta (Royal Celebrations)', 'royalcelebrations@banquets.com', '+91 98205 66778', @default_pass, 'DONOR', 'VERIFIED', 'Gokhale Road, Naupada, Thane West', 'Thane', 19.1860, 72.9759);

-- 5 NGOs
INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `status`, `address`, `city`, `latitude`, `longitude`) VALUES
(7, 'Robin Hood Army Mumbai Chapter', 'rha.mumbai@robinhoodarmy.com', '+91 98330 11223', @default_pass, 'NGO', 'VERIFIED', 'Community Centre, Matunga East', 'Mumbai', 19.0269, 72.8553),
(8, 'Akshaya Food Relief Foundation', 'akshaya@relief.org', '+91 98331 22334', @default_pass, 'NGO', 'VERIFIED', 'Sion Trombay Road, Chembur', 'Mumbai', 19.0622, 72.8970),
(9, 'Feeding Smiles Foundation', 'contact@feedingsmiles.org', '+91 98332 33445', @default_pass, 'NGO', 'VERIFIED', 'Station Road, Vile Parle East', 'Mumbai', 19.0988, 72.8479),
(10, 'Mumbai Roti Bank Trust', 'operations@mumbairotibank.org', '+91 98333 44556', @default_pass, 'NGO', 'VERIFIED', 'Mahim West, Near Railway Station', 'Mumbai', 19.0402, 72.8441),
(11, 'Hope Children Care & Welfare Trust', 'support@hopewelfare.org', '+91 98334 55667', @default_pass, 'NGO', 'VERIFIED', 'Ghatkopar West Central Market', 'Mumbai', 19.0860, 72.9090);

-- 3. Donor Profiles
INSERT INTO `donor_profiles` (`user_id`, `organization_name`, `donor_type`, `fssai_license`, `contact_person`, `operating_hours`) VALUES
(2, 'Annapoorna Catering Services', 'Restaurant', 'FSSAI-11518001000234', 'Rajesh Sharma', '7:00 AM - 11:30 PM'),
(3, 'The Grand Residency Hotel', 'Hotel', 'FSSAI-11516002000889', 'Priya Merchant', '24 Hours'),
(4, 'Green Valley Campus Cafeteria & Hostel', 'Cafeteria', 'FSSAI-11520003000551', 'Arvind Kulkarni', '6:30 AM - 10:00 PM'),
(5, 'Spice Garden Family Restaurant', 'Restaurant', 'FSSAI-11519004000312', 'Sanjay Deshmukh', '11:00 AM - Midnight'),
(6, 'Royal Celebrations Banquet & Lawn', 'Event Organizer', 'FSSAI-11517005000781', 'Manish Mehta', '10:00 AM - 1:00 AM');

-- 4. NGO Profiles
INSERT INTO `ngo_profiles` (`user_id`, `ngo_name`, `registration_number`, `accepted_categories`, `serving_capacity`, `vehicle_type`) VALUES
(7, 'Robin Hood Army Mumbai Chapter', 'RHA-MH-2018-091', 'Cooked Meals,Rice,Bread,Fruits,Bakery', 350, 'Electric Vans & Volunteer Two-Wheelers'),
(8, 'Akshaya Food Relief Foundation', 'AFRF-IN-2016-442', 'Cooked Meals,Rice,Bread,Vegetables,Packaged Food,Dairy', 500, 'Temperature Controlled Mini Truck'),
(9, 'Feeding Smiles Foundation', 'FSM-MH-2020-119', 'Cooked Meals,Bread,Fruits,Bakery,Packaged Food', 180, '2 Insulated Utility Vans'),
(10, 'Mumbai Roti Bank Trust', 'RBS-MH-2015-883', 'Cooked Meals,Rice,Bread,Vegetables,Dairy', 450, '3 Dedicated GPS-enabled Vans'),
(11, 'Hope Children Care & Welfare Trust', 'HCCT-MH-2019-304', 'Fruits,Bakery,Packaged Food,Dairy,Cooked Meals', 150, 'Covered Delivery Auto & Car');

-- 5. Donations (15 realistic records with various statuses, urgencies, categories)
-- Statuses: AVAILABLE, CLAIMED, PICKUP_SCHEDULED, PICKED_UP, COMPLETED, CANCELLED, EXPIRED
INSERT INTO `donations` (`id`, `donor_id`, `food_name`, `category`, `description`, `quantity`, `quantity_unit`, `servings`, `prep_time`, `expiry_time`, `pickup_address`, `city`, `latitude`, `longitude`, `is_veg`, `allergens`, `packaging_type`, `image_url`, `pickup_instructions`, `status`, `verification_code`, `claimed_by`, `claimed_at`, `created_at`) VALUES
-- 1. Available, urgent (~3h remaining)
(1, 2, 'Vegetable Pulao & Mixed Dal Tadka', 'Cooked Meals', 'Freshly cooked aromatic veg pulao and yellow moong dal prepared for afternoon lunch buffet. Kept hot in food grade warming containers.', 28.00, 'kg', 65, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 3 HOUR), '14 Shivaji Park Road, Dadar West', 'Mumbai', 19.0280, 72.8397, 1, 'None', 'Stainless Steel Insulated Urns', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', 'Collect from rear service kitchen entry. Security has gate pass ready.', 'AVAILABLE', 'FR-DAD-8841', NULL, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- 2. Available, critical (~1.5h remaining)
(2, 3, 'Continental Breakfast Croissants & Rolls', 'Bakery', 'Assorted butter croissants, cinnamon rolls, whole wheat dinner rolls untouched from morning hotel breakfast service.', 14.50, 'kg', 40, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_ADD(NOW(), INTERVAL 90 MINUTE), 'Hill Road, Near Bandra Station, Bandra West', 'Mumbai', 19.0596, 72.8295, 1, 'Wheat, Dairy', 'Food Grade Bakery Crates', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80', 'Hotel loading dock near basement parking bay B-2.', 'AVAILABLE', 'FR-BAN-2940', NULL, NULL, DATE_SUB(NOW(), INTERVAL 4 HOUR)),

-- 3. Available, soon (~8h remaining)
(3, 4, 'Chana Masala & Phulka Rotis', 'Cooked Meals', 'Wholesome homestyle chana masala gravy with 250 fresh soft whole wheat phulkas from hostel mess.', 35.00, 'kg', 85, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 8 HOUR), 'Hostel Block 4, IIT Powai Campus', 'Mumbai', 19.1254, 72.9157, 1, 'Wheat', 'Clean Silver Foil Casseroles', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80', 'Show digital volunteer badge at Campus Gate 2 for vehicle permit.', 'AVAILABLE', 'FR-POW-5512', NULL, NULL, DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- 4. Available, normal (>14h remaining)
(4, 5, 'Fresh Farm Bananas and Sweet Oranges', 'Fruits', 'Two crates of seasonal ripe bananas and Nagpur oranges from fruit salad bar surplus.', 45.00, 'kg', 90, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 20 HOUR), 'Link Road, Andheri West', 'Mumbai', 19.1363, 72.8277, 1, 'None', 'Ventilated Fruit Crates', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80', 'Direct street level counter behind restaurant parking.', 'AVAILABLE', 'FR-AND-7104', NULL, NULL, DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- 5. Available, normal (>16h remaining)
(5, 6, 'Unopened Fruit Juice Cartons & Biscuits', 'Packaged Food', 'Commercial tetra packs of apple and mango juice along with glucose biscuit packets from corporate expo.', 55.00, 'kg', 120, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 72 HOUR), 'Gokhale Road, Naupada, Thane West', 'Thane', 19.1860, 72.9759, 1, 'None', 'Original Sealed Corrugated Boxes', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', 'Banquet reception desk; speak with Manager Manish.', 'AVAILABLE', 'FR-THA-9023', NULL, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- 6. Claimed by Robin Hood Army
(6, 2, 'Paneer Butter Masala & Jeera Rice', 'Cooked Meals', 'Rich cottage cheese tomato gravy curry and fluffy cumin spiced basmati rice for 100 people.', 42.00, 'kg', 100, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), '14 Shivaji Park Road, Dadar West', 'Mumbai', 19.0280, 72.8397, 1, 'Dairy', 'Deep Stainless Steel Vessels', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80', 'Please bring your own transport containers or return ours tomorrow.', 'CLAIMED', 'FR-CLM-1102', 7, DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 3 HOUR)),

-- 7. Pickup Scheduled by Akshaya Relief
(7, 3, 'Assorted Indian Sweets & Snack Boxes', 'Bakery', 'Festive banquet leftover motichoor laddoos, kaju katli and roasted savory mixture.', 25.00, 'kg', 75, DATE_SUB(NOW(), INTERVAL 4 HOUR), DATE_ADD(NOW(), INTERVAL 12 HOUR), 'Hill Road, Near Bandra Station, Bandra West', 'Mumbai', 19.0596, 72.8295, 1, 'Dairy, Nuts', 'Food Gift Boxes', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80', 'Call Priya Merchant when vehicle reaches outer portico.', 'PICKUP_SCHEDULED', 'FR-SCH-3391', 8, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR)),

-- 8. Picked Up by Mumbai Roti Bank
(8, 5, 'Vegetable Biryani & Boondi Raita', 'Cooked Meals', 'Hyderabadi style vegetable biryani with saffron and curd raita.', 60.00, 'kg', 140, DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'Link Road, Andheri West', 'Mumbai', 19.1363, 72.8277, 1, 'Dairy', 'Double Sealed Barrels', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', 'Handed over to Roti Bank van MH-02-CP-8812.', 'PICKED_UP', 'FR-PKD-4482', 10, DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 5 HOUR)),

-- 9. Completed by Robin Hood Army
(9, 2, 'South Indian Meal Feast (Sambar, Rice, Poriyal)', 'Cooked Meals', 'Full South Indian traditional lunch spread from community temple function.', 80.00, 'kg', 200, DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 18 HOUR), '14 Shivaji Park Road, Dadar West', 'Mumbai', 19.0280, 72.8397, 1, 'Mustard', 'Sealed Thermal Drums', 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80', 'Distributed across Dharavi & Mahim slum clusters successfully.', 'COMPLETED', 'FR-CMP-5591', 7, DATE_SUB(NOW(), INTERVAL 23 HOUR), DATE_SUB(NOW(), INTERVAL 24 HOUR)),

-- 10. Completed by Feeding Smiles
(10, 4, 'Bread Loaves, Butter and Mixed Fruit Jam', 'Bakery', 'Untouched breakfast supplies from university sports day.', 30.00, 'kg', 80, DATE_SUB(NOW(), INTERVAL 48 HOUR), DATE_SUB(NOW(), INTERVAL 36 HOUR), 'Hostel Block 4, IIT Powai Campus', 'Mumbai', 19.1254, 72.9157, 1, 'Wheat, Dairy', 'Sealed Crates', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', 'Distributed to night shelter children in Ghatkopar.', 'COMPLETED', 'FR-CMP-7712', 9, DATE_SUB(NOW(), INTERVAL 46 HOUR), DATE_SUB(NOW(), INTERVAL 48 HOUR)),

-- 11. Completed by Mumbai Roti Bank
(11, 6, 'Royal Wedding Buffet Curry Spread & Rotis', 'Cooked Meals', 'Dal makhani, shahi paneer, mixed vegetable subzi and tandoori rotis.', 110.00, 'kg', 280, DATE_SUB(NOW(), INTERVAL 72 HOUR), DATE_SUB(NOW(), INTERVAL 64 HOUR), 'Gokhale Road, Naupada, Thane West', 'Thane', 19.1860, 72.9759, 1, 'Dairy, Wheat', 'Commercial Aluminum Degchis', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', 'Successfully transported via refrigerated rescue van.', 'COMPLETED', 'FR-CMP-9901', 10, DATE_SUB(NOW(), INTERVAL 70 HOUR), DATE_SUB(NOW(), INTERVAL 72 HOUR)),

-- 12. Available, urgent (~4.5h remaining)
(12, 3, 'Fresh Farm Milk & Paneer Blocks', 'Dairy', 'Unopened pasteurized milk pouches (20L) and fresh malai paneer blocks (15kg).', 35.00, 'kg', 90, DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_ADD(NOW(), INTERVAL 4 HOUR), 'Hill Road, Near Bandra Station, Bandra West', 'Mumbai', 19.0596, 72.8295, 1, 'Dairy', 'Insulated Ice Box', 'https://images.unsplash.com/photo-1528732263440-4dd1a18a4cc2?w=600&auto=format&fit=crop&q=80', 'Must be kept cold during transit. Chilled ice gel packs provided.', 'AVAILABLE', 'FR-BAN-4821', NULL, NULL, DATE_SUB(NOW(), INTERVAL 2 HOUR)),

-- 13. Available, normal (>18h remaining)
(13, 5, 'Crisp Salad Greens, Tomatoes & Cucumbers', 'Vegetables', 'Washed, diced and fresh salad bar produce packaged in airtight crates.', 22.00, 'kg', 55, DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_ADD(NOW(), INTERVAL 18 HOUR), 'Link Road, Andheri West', 'Mumbai', 19.1363, 72.8277, 1, 'None', 'Air-tight Translucent Tubs', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', 'Counter service desk at ground floor.', 'AVAILABLE', 'FR-AND-3312', NULL, NULL, DATE_SUB(NOW(), INTERVAL 1 HOUR)),

-- 14. Cancelled (Donor realized shortage)
(14, 2, 'Vegetable Hakka Noodles & Manchurian', 'Cooked Meals', 'Party order surplus cancelled by host.', 18.00, 'kg', 45, DATE_SUB(NOW(), INTERVAL 10 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR), '14 Shivaji Park Road, Dadar West', 'Mumbai', 19.0280, 72.8397, 1, 'Soy, Wheat', 'Hot Boxes', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80', 'Self-consumed by staff.', 'CANCELLED', 'FR-CAN-6619', NULL, NULL, DATE_SUB(NOW(), INTERVAL 10 HOUR)),

-- 15. Expired
(15, 6, 'Assorted Tea Sandwiches & Fruit Tarts', 'Bakery', 'Afternoon corporate tea spread.', 12.00, 'kg', 30, DATE_SUB(NOW(), INTERVAL 14 HOUR), DATE_SUB(NOW(), INTERVAL 4 HOUR), 'Gokhale Road, Naupada, Thane West', 'Thane', 19.1860, 72.9759, 1, 'Wheat, Dairy', 'Cardboard Trays', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80', 'Time passed before claim. Safely diverted to composting unit.', 'EXPIRED', 'FR-EXP-2011', NULL, NULL, DATE_SUB(NOW(), INTERVAL 14 HOUR));

-- 6. Donation Claims
INSERT INTO `donation_claims` (`id`, `donation_id`, `ngo_id`, `claim_status`, `claimed_at`, `notes`) VALUES
(1, 6, 7, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 30 MINUTE), 'Robin Hood Army volunteers mobilizing auto pickup from Dadar.'),
(2, 7, 8, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 2 HOUR), 'Akshaya Foundation refrigerated mini truck dispatched.'),
(3, 8, 10, 'ACTIVE', DATE_SUB(NOW(), INTERVAL 3 HOUR), 'Mumbai Roti Bank collection van en-route to Bandra/Andheri cluster.'),
(4, 9, 7, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 23 HOUR), 'Served 200 hot meals at Dharavi transit camp.'),
(5, 10, 9, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 46 HOUR), 'Breakfast provisions distributed to children home in Ghatkopar.'),
(6, 11, 10, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 70 HOUR), 'Transferred to community food distribution kitchen.');

-- 7. Pickup Records
INSERT INTO `pickup_records` (`id`, `donation_id`, `ngo_id`, `scheduled_date`, `scheduled_time`, `contact_person`, `contact_phone`, `pickup_notes`, `status`, `verified_at`, `completed_at`) VALUES
(1, 6, 7, CURDATE(), ADDTIME(CURTIME(), '01:00:00'), 'Aakash Verma (RHA Lead)', '+91 98330 99881', 'Team arriving with 4 food grade thermal transport cans.', 'SCHEDULED', NULL, NULL),
(2, 7, 8, CURDATE(), ADDTIME(CURTIME(), '02:00:00'), 'Sunil Jadhav (Driver)', '+91 98331 88772', 'Refrigerated van MH-03-BW-4419 reaching in 45 minutes.', 'ARRIVED', NULL, NULL),
(3, 8, 10, CURDATE(), SUBTIME(CURTIME(), '01:00:00'), 'Santosh Gaikwad', '+91 98333 77663', 'QR Code successfully verified at loading dock.', 'PICKED_UP', DATE_SUB(NOW(), INTERVAL 45 MINUTE), NULL),
(4, 9, 7, DATE_SUB(CURDATE(), INTERVAL 1 DAY), '14:30:00', 'Aakash Verma', '+91 98330 99881', 'QR Code scanned and validated on site.', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 22 HOUR), DATE_SUB(NOW(), INTERVAL 21 HOUR)),
(5, 10, 9, DATE_SUB(CURDATE(), INTERVAL 2 DAY), '10:00:00', 'Meera Iyer', '+91 98332 66554', 'Handover confirmed with Hostel Warden.', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 45 HOUR), DATE_SUB(NOW(), INTERVAL 44 HOUR)),
(6, 11, 10, DATE_SUB(CURDATE(), INTERVAL 3 DAY), '23:30:00', 'Santosh Gaikwad', '+91 98333 77663', 'Late night wedding pickup completed safely.', 'COMPLETED', DATE_SUB(NOW(), INTERVAL 69 HOUR), DATE_SUB(NOW(), INTERVAL 68 HOUR));

-- 8. Notifications
INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `related_id`, `is_read`, `created_at`) VALUES
(1, 2, 'Donation Claimed!', 'Robin Hood Army Mumbai Chapter has claimed your donation: "Paneer Butter Masala & Jeera Rice".', 'DONATION_CLAIMED', 6, 0, DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
(2, 7, 'Pickup Scheduled', 'Your pickup for donation "Paneer Butter Masala & Jeera Rice" is scheduled for Dadar West today.', 'PICKUP_SCHEDULED', 6, 0, DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
(3, 3, 'Pickup In Progress', 'Akshaya Food Relief Foundation vehicle has marked arrival at Bandra West.', 'ALERT', 7, 0, DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(4, 5, 'Pickup Successfully Verified', 'QR Handover verified for "Vegetable Biryani & Boondi Raita" by Mumbai Roti Bank.', 'PICKUP_VERIFIED', 8, 1, DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
(5, 7, 'Donation Completed - Thank You!', 'Donation #9 "South Indian Meal Feast" marked as completed. 200 meals rescued!', 'DONATION_COMPLETED', 9, 1, DATE_SUB(NOW(), INTERVAL 21 HOUR)),
(6, 1, 'New NGO Verified', 'Hope Children Care & Welfare Trust documentation has been auto-verified.', 'USER_VERIFIED', 11, 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(7, 8, 'Urgent Donation Nearby!', 'Vegetable Pulao & Mixed Dal Tadka (65 servings) is available 3.2 km away with 3 hours remaining.', 'NEW_DONATION', 1, 0, DATE_SUB(NOW(), INTERVAL 2 HOUR));

-- 9. Admin Actions (Audit Trail)
INSERT INTO `admin_actions` (`admin_id`, `action_type`, `target_type`, `target_id`, `details`, `created_at`) VALUES
(1, 'VERIFY_USER', 'USER', 2, 'Verified FSSAI license & identity for Annapoorna Catering Services', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(1, 'VERIFY_USER', 'USER', 7, 'Verified 80G and NGO Darpan registration for Robin Hood Army Mumbai', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(1, 'VERIFY_USER', 'USER', 8, 'Verified registration certificate and cold-chain compliance for Akshaya Foundation', DATE_SUB(NOW(), INTERVAL 8 DAY)),
(1, 'AUDIT_DONATION', 'DONATION', 9, 'Verified impact metric of 200 meals recorded for community audit', DATE_SUB(NOW(), INTERVAL 1 DAY));
