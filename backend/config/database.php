<?php
// FoodRescue Database Connection & Auto-Setup
require_once __DIR__ . '/config.php';

class Database {
    private static ?PDO $instance = null;
    private static string $driver = 'mysql';

    public static function getConnection(): PDO {
        if (self::$instance !== null) {
            return self::$instance;
        }

        $host = DB_HOST;
        $port = DB_PORT;
        $dbName = DB_NAME;
        $user = DB_USER;
        $pass = DB_PASS;

        try {
            // Attempt MySQL connection
            $dsn = "mysql:host={$host};port={$port};charset=utf8mb4";
            $pdo = new PDO($dsn, $user, $pass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);

            // Ensure database exists
            $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo->exec("USE `{$dbName}`");

            // Verify if tables are populated; if not, auto-run schema and seed
            $checkTable = $pdo->query("SHOW TABLES LIKE 'users'")->fetch();
            if (!$checkTable) {
                self::initializeMySQL($pdo);
            }

            self::$driver = 'mysql';
            self::$instance = $pdo;
            return self::$instance;
        } catch (PDOException $e) {
            // If MySQL is not running or credentials failed, fall back to SQLite for 100% local operation
            error_log("MySQL connection failed: " . $e->getMessage() . ". Falling back to local SQLite database.");
            return self::getSQLiteConnection();
        }
    }

    private static function initializeMySQL(PDO $pdo): void {
        $schemaFile = __DIR__ . '/../../database/schema.sql';
        $seedFile = __DIR__ . '/../../database/seed.sql';

        if (file_exists($schemaFile)) {
            $sql = file_get_contents($schemaFile);
            $pdo->exec($sql);
        }
        if (file_exists($seedFile)) {
            $sql = file_get_contents($seedFile);
            $pdo->exec($sql);
        }
    }

    private static function getSQLiteConnection(): PDO {
        $dbDir = __DIR__ . '/../../database';
        if (!is_dir($dbDir)) {
            @mkdir($dbDir, 0755, true);
        }
        $sqliteFile = $dbDir . '/foodrescue.sqlite';
        $needsInit = !file_exists($sqliteFile) || filesize($sqliteFile) === 0;

        $pdo = new PDO("sqlite:" . $sqliteFile, null, null, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);

        if ($needsInit) {
            self::initializeSQLite($pdo);
        }

        self::$driver = 'sqlite';
        self::$instance = $pdo;
        return self::$instance;
    }

    private static function initializeSQLite(PDO $pdo): void {
        // SQLite compatible schema & seed
        $pdo->exec("PRAGMA foreign_keys = ON;");
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                phone TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL,
                status TEXT DEFAULT 'PENDING',
                address TEXT NOT NULL,
                city TEXT NOT NULL,
                latitude REAL DEFAULT 19.0760,
                longitude REAL DEFAULT 72.8777,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS donor_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                organization_name TEXT NOT NULL,
                donor_type TEXT NOT NULL,
                fssai_license TEXT,
                contact_person TEXT,
                operating_hours TEXT DEFAULT '9:00 AM - 11:00 PM',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS ngo_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                ngo_name TEXT NOT NULL,
                registration_number TEXT NOT NULL,
                accepted_categories TEXT NOT NULL,
                serving_capacity INTEGER NOT NULL DEFAULT 100,
                vehicle_type TEXT DEFAULT 'Van / Electric Vehicle',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS food_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE,
                description TEXT,
                storage_temp TEXT DEFAULT 'Ambient / Chilled'
            );

            CREATE TABLE IF NOT EXISTS donations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                donor_id INTEGER NOT NULL,
                food_name TEXT NOT NULL,
                category TEXT NOT NULL,
                description TEXT,
                quantity REAL NOT NULL,
                quantity_unit TEXT NOT NULL DEFAULT 'kg',
                servings INTEGER NOT NULL,
                prep_time DATETIME NOT NULL,
                expiry_time DATETIME NOT NULL,
                pickup_address TEXT NOT NULL,
                city TEXT NOT NULL,
                latitude REAL NOT NULL,
                longitude REAL NOT NULL,
                is_veg INTEGER NOT NULL DEFAULT 1,
                allergens TEXT DEFAULT 'None',
                packaging_type TEXT DEFAULT 'Clean sealed containers',
                image_url TEXT,
                pickup_instructions TEXT,
                status TEXT DEFAULT 'AVAILABLE',
                verification_code TEXT UNIQUE,
                claimed_by INTEGER,
                claimed_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (claimed_by) REFERENCES users(id) ON DELETE SET NULL
            );

            CREATE TABLE IF NOT EXISTS donation_claims (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                donation_id INTEGER NOT NULL,
                ngo_id INTEGER NOT NULL,
                claim_status TEXT DEFAULT 'ACTIVE',
                claimed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                notes TEXT,
                FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
                FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS pickup_records (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                donation_id INTEGER NOT NULL UNIQUE,
                ngo_id INTEGER NOT NULL,
                scheduled_date TEXT NOT NULL,
                scheduled_time TEXT NOT NULL,
                contact_person TEXT NOT NULL,
                contact_phone TEXT NOT NULL,
                pickup_notes TEXT,
                status TEXT DEFAULT 'SCHEDULED',
                verified_at DATETIME,
                completed_at DATETIME,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (donation_id) REFERENCES donations(id) ON DELETE CASCADE,
                FOREIGN KEY (ngo_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'ALERT',
                related_id INTEGER,
                is_read INTEGER DEFAULT 0,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS admin_actions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                admin_id INTEGER NOT NULL,
                action_type TEXT NOT NULL,
                target_type TEXT NOT NULL,
                target_id INTEGER NOT NULL,
                details TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
            );
        ");

        // Seed data for SQLite
        $passHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // Password@123 / secret
        
        // Food categories
        $pdo->exec("
            INSERT OR IGNORE INTO food_categories (id, name, description, storage_temp) VALUES
            (1, 'Cooked Meals', 'Freshly prepared hot curries, biryani, sabzi, daal', 'Warm (>60°C) or rapid chilled'),
            (2, 'Rice', 'Cooked basmati, jeera rice, pulao, plain boiled rice', 'Warm or refrigerated'),
            (3, 'Bread', 'Rotis, chapatis, naans, parathas, dinner rolls', 'Dry ambient container'),
            (4, 'Fruits', 'Fresh seasonal bananas, apples, oranges, papayas', 'Ambient / ventilated'),
            (5, 'Vegetables', 'Raw fresh greens, potatoes, onions, tomatoes', 'Cool ambient / refrigerated'),
            (6, 'Bakery', 'Breads, muffins, sandwich loaves, buns, croissants', 'Cool dry storage'),
            (7, 'Packaged Food', 'Biscuits, packaged fruit juices, snacks, tetra packs', 'Dry ambient shelf'),
            (8, 'Dairy', 'Paneer, curd, milk packets, cheese', 'Refrigerated (<4°C)'),
            (9, 'Other', 'Dry grains, assorted festive sweets, condiments', 'Ambient storage');
        ");

        // Users
        $pdo->exec("
            INSERT OR IGNORE INTO users (id, name, email, phone, password_hash, role, status, address, city, latitude, longitude) VALUES
            (1, 'System Administrator', 'admin@foodrescue.org', '+91 98200 11000', '{$passHash}', 'ADMIN', 'VERIFIED', 'BMC Disaster Management Cell, Fort', 'Mumbai', 18.9322, 72.8335),
            (2, 'Chef Rajesh Sharma (Annapoorna)', 'annapoorna@gmail.com', '+91 98201 22334', '{$passHash}', 'DONOR', 'VERIFIED', '14 Shivaji Park Road, Dadar West', 'Mumbai', 19.0280, 72.8397),
            (3, 'Priya Merchant (Grand Residency)', 'grandresidency@hotel.com', '+91 98202 33445', '{$passHash}', 'DONOR', 'VERIFIED', 'Hill Road, Near Bandra Station, Bandra West', 'Mumbai', 19.0596, 72.8295),
            (4, 'Prof. Arvind Kulkarni (Green Valley)', 'hostel@greenvalley.edu', '+91 98203 44556', '{$passHash}', 'DONOR', 'VERIFIED', 'Hostel Block 4, IIT Powai Campus', 'Mumbai', 19.1254, 72.9157),
            (5, 'Sanjay Deshmukh (Spice Garden)', 'spicegarden@restaurant.com', '+91 98204 55667', '{$passHash}', 'DONOR', 'VERIFIED', 'Link Road, Andheri West', 'Mumbai', 19.1363, 72.8277),
            (6, 'Manish Mehta (Royal Celebrations)', 'royalcelebrations@banquets.com', '+91 98205 66778', '{$passHash}', 'DONOR', 'VERIFIED', 'Gokhale Road, Naupada, Thane West', 'Thane', 19.1860, 72.9759),
            (7, 'Robin Hood Army Mumbai Chapter', 'rha.mumbai@robinhoodarmy.com', '+91 98330 11223', '{$passHash}', 'NGO', 'VERIFIED', 'Community Centre, Matunga East', 'Mumbai', 19.0269, 72.8553),
            (8, 'Akshaya Food Relief Foundation', 'akshaya@relief.org', '+91 98331 22334', '{$passHash}', 'NGO', 'VERIFIED', 'Sion Trombay Road, Chembur', 'Mumbai', 19.0622, 72.8970),
            (9, 'Feeding Smiles Foundation', 'contact@feedingsmiles.org', '+91 98332 33445', '{$passHash}', 'NGO', 'VERIFIED', 'Station Road, Vile Parle East', 'Mumbai', 19.0988, 72.8479),
            (10, 'Mumbai Roti Bank Trust', 'operations@mumbairotibank.org', '+91 98333 44556', '{$passHash}', 'NGO', 'VERIFIED', 'Mahim West, Near Railway Station', 'Mumbai', 19.0402, 72.8441),
            (11, 'Hope Children Care & Welfare Trust', 'support@hopewelfare.org', '+91 98334 55667', '{$passHash}', 'NGO', 'VERIFIED', 'Ghatkopar West Central Market', 'Mumbai', 19.0860, 72.9090);
        ");

        // Profiles
        $pdo->exec("
            INSERT OR IGNORE INTO donor_profiles (user_id, organization_name, donor_type, fssai_license, contact_person, operating_hours) VALUES
            (2, 'Annapoorna Catering Services', 'Restaurant', 'FSSAI-11518001000234', 'Rajesh Sharma', '7:00 AM - 11:30 PM'),
            (3, 'The Grand Residency Hotel', 'Hotel', 'FSSAI-11516002000889', 'Priya Merchant', '24 Hours'),
            (4, 'Green Valley Campus Cafeteria & Hostel', 'Cafeteria', 'FSSAI-11520003000551', 'Arvind Kulkarni', '6:30 AM - 10:00 PM'),
            (5, 'Spice Garden Family Restaurant', 'Restaurant', 'FSSAI-11519004000312', 'Sanjay Deshmukh', '11:00 AM - Midnight'),
            (6, 'Royal Celebrations Banquet & Lawn', 'Event Organizer', 'FSSAI-11517005000781', 'Manish Mehta', '10:00 AM - 1:00 AM');

            INSERT OR IGNORE INTO ngo_profiles (user_id, ngo_name, registration_number, accepted_categories, serving_capacity, vehicle_type) VALUES
            (7, 'Robin Hood Army Mumbai Chapter', 'RHA-MH-2018-091', 'Cooked Meals,Rice,Bread,Fruits,Bakery', 350, 'Electric Vans & Volunteer Two-Wheelers'),
            (8, 'Akshaya Food Relief Foundation', 'AFRF-IN-2016-442', 'Cooked Meals,Rice,Bread,Vegetables,Packaged Food,Dairy', 500, 'Temperature Controlled Mini Truck'),
            (9, 'Feeding Smiles Foundation', 'FSM-MH-2020-119', 'Cooked Meals,Bread,Fruits,Bakery,Packaged Food', 180, '2 Insulated Utility Vans'),
            (10, 'Mumbai Roti Bank Trust', 'RBS-MH-2015-883', 'Cooked Meals,Rice,Bread,Vegetables,Dairy', 450, '3 Dedicated GPS-enabled Vans'),
            (11, 'Hope Children Care & Welfare Trust', 'HCCT-MH-2019-304', 'Fruits,Bakery,Packaged Food,Dairy,Cooked Meals', 150, 'Covered Delivery Auto & Car');
        ");

        // Donations
        $pdo->exec("
            INSERT OR IGNORE INTO donations (id, donor_id, food_name, category, description, quantity, quantity_unit, servings, prep_time, expiry_time, pickup_address, city, latitude, longitude, is_veg, allergens, packaging_type, image_url, pickup_instructions, status, verification_code, claimed_by, claimed_at, created_at) VALUES
            (1, 2, 'Vegetable Pulao & Mixed Dal Tadka', 'Cooked Meals', 'Freshly cooked aromatic veg pulao and yellow moong dal prepared for afternoon lunch buffet. Kept hot in food grade warming containers.', 28.00, 'kg', 65, datetime('now', '-2 hours'), datetime('now', '+3 hours'), '14 Shivaji Park Road, Dadar West', 'Mumbai', 19.0280, 72.8397, 1, 'None', 'Stainless Steel Insulated Urns', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', 'Collect from rear service kitchen entry. Security has gate pass ready.', 'AVAILABLE', 'FR-DAD-8841', NULL, NULL, datetime('now', '-2 hours')),
            (2, 3, 'Continental Breakfast Croissants & Rolls', 'Bakery', 'Assorted butter croissants, cinnamon rolls, whole wheat dinner rolls untouched from morning hotel breakfast service.', 14.50, 'kg', 40, datetime('now', '-5 hours'), datetime('now', '+90 minutes'), 'Hill Road, Near Bandra Station, Bandra West', 'Mumbai', 19.0596, 72.8295, 1, 'Wheat, Dairy', 'Food Grade Bakery Crates', 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&auto=format&fit=crop&q=80', 'Hotel loading dock near basement parking bay B-2.', 'AVAILABLE', 'FR-BAN-2940', NULL, NULL, datetime('now', '-4 hours')),
            (3, 4, 'Chana Masala & Phulka Rotis', 'Cooked Meals', 'Wholesome homestyle chana masala gravy with 250 fresh soft whole wheat phulkas from hostel mess.', 35.00, 'kg', 85, datetime('now', '-1 hours'), datetime('now', '+8 hours'), 'Hostel Block 4, IIT Powai Campus', 'Mumbai', 19.1254, 72.9157, 1, 'Wheat', 'Clean Silver Foil Casseroles', 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80', 'Show digital volunteer badge at Campus Gate 2 for vehicle permit.', 'AVAILABLE', 'FR-POW-5512', NULL, NULL, datetime('now', '-1 hours')),
            (4, 5, 'Fresh Farm Bananas and Sweet Oranges', 'Fruits', 'Two crates of seasonal ripe bananas and Nagpur oranges from fruit salad bar surplus.', 45.00, 'kg', 90, datetime('now', '-3 hours'), datetime('now', '+20 hours'), 'Link Road, Andheri West', 'Mumbai', 19.1363, 72.8277, 1, 'None', 'Ventilated Fruit Crates', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80', 'Direct street level counter behind restaurant parking.', 'AVAILABLE', 'FR-AND-7104', NULL, NULL, datetime('now', '-3 hours')),
            (5, 6, 'Unopened Fruit Juice Cartons & Biscuits', 'Packaged Food', 'Commercial tetra packs of apple and mango juice along with glucose biscuit packets from corporate expo.', 55.00, 'kg', 120, datetime('now', '-2 hours'), datetime('now', '+72 hours'), 'Gokhale Road, Naupada, Thane West', 'Thane', 19.1860, 72.9759, 1, 'None', 'Original Sealed Corrugated Boxes', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80', 'Banquet reception desk; speak with Manager Manish.', 'AVAILABLE', 'FR-THA-9023', NULL, NULL, datetime('now', '-2 hours')),
            (6, 2, 'Paneer Butter Masala & Jeera Rice', 'Cooked Meals', 'Rich cottage cheese tomato gravy curry and fluffy cumin spiced basmati rice for 100 people.', 42.00, 'kg', 100, datetime('now', '-3 hours'), datetime('now', '+4 hours'), '14 Shivaji Park Road, Dadar West', 'Mumbai', 19.0280, 72.8397, 1, 'Dairy', 'Deep Stainless Steel Vessels', 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80', 'Please bring your own transport containers or return ours tomorrow.', 'CLAIMED', 'FR-CLM-1102', 7, datetime('now', '-30 minutes'), datetime('now', '-3 hours')),
            (7, 3, 'Assorted Indian Sweets & Snack Boxes', 'Bakery', 'Festive banquet leftover motichoor laddoos, kaju katli and roasted savory mixture.', 25.00, 'kg', 75, datetime('now', '-4 hours'), datetime('now', '+12 hours'), 'Hill Road, Near Bandra Station, Bandra West', 'Mumbai', 19.0596, 72.8295, 1, 'Dairy, Nuts', 'Food Gift Boxes', 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80', 'Call Priya Merchant when vehicle reaches outer portico.', 'PICKUP_SCHEDULED', 'FR-SCH-3391', 8, datetime('now', '-2 hours'), datetime('now', '-4 hours')),
            (8, 5, 'Vegetable Biryani & Boondi Raita', 'Cooked Meals', 'Hyderabadi style vegetable biryani with saffron and curd raita.', 60.00, 'kg', 140, datetime('now', '-5 hours'), datetime('now', '+3 hours'), 'Link Road, Andheri West', 'Mumbai', 19.1363, 72.8277, 1, 'Dairy', 'Double Sealed Barrels', 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80', 'Handed over to Roti Bank van MH-02-CP-8812.', 'PICKED_UP', 'FR-PKD-4482', 10, datetime('now', '-3 hours'), datetime('now', '-5 hours')),
            (9, 2, 'South Indian Meal Feast (Sambar, Rice, Poriyal)', 'Cooked Meals', 'Full South Indian traditional lunch spread from community temple function.', 80.00, 'kg', 200, datetime('now', '-24 hours'), datetime('now', '-18 hours'), '14 Shivaji Park Road, Dadar West', 'Mumbai', 19.0280, 72.8397, 1, 'Mustard', 'Sealed Thermal Drums', 'https://images.unsplash.com/photo-1610192244261-3f33de3f55e4?w=600&auto=format&fit=crop&q=80', 'Distributed across Dharavi & Mahim slum clusters successfully.', 'COMPLETED', 'FR-CMP-5591', 7, datetime('now', '-23 hours'), datetime('now', '-24 hours')),
            (10, 4, 'Bread Loaves, Butter and Mixed Fruit Jam', 'Bakery', 'Untouched breakfast supplies from university sports day.', 30.00, 'kg', 80, datetime('now', '-48 hours'), datetime('now', '-36 hours'), 'Hostel Block 4, IIT Powai Campus', 'Mumbai', 19.1254, 72.9157, 1, 'Wheat, Dairy', 'Sealed Crates', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&auto=format&fit=crop&q=80', 'Distributed to night shelter children in Ghatkopar.', 'COMPLETED', 'FR-CMP-7712', 9, datetime('now', '-46 hours'), datetime('now', '-48 hours')),
            (11, 6, 'Royal Wedding Buffet Curry Spread & Rotis', 'Cooked Meals', 'Dal makhani, shahi paneer, mixed vegetable subzi and tandoori rotis.', 110.00, 'kg', 280, datetime('now', '-72 hours'), datetime('now', '-64 hours'), 'Gokhale Road, Naupada, Thane West', 'Thane', 19.1860, 72.9759, 1, 'Dairy, Wheat', 'Commercial Aluminum Degchis', 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80', 'Successfully transported via refrigerated rescue van.', 'COMPLETED', 'FR-CMP-9901', 10, datetime('now', '-70 hours'), datetime('now', '-72 hours')),
            (12, 3, 'Fresh Farm Milk & Paneer Blocks', 'Dairy', 'Unopened pasteurized milk pouches (20L) and fresh malai paneer blocks (15kg).', 35.00, 'kg', 90, datetime('now', '-2 hours'), datetime('now', '+4 hours'), 'Hill Road, Near Bandra Station, Bandra West', 'Mumbai', 19.0596, 72.8295, 1, 'Dairy', 'Insulated Ice Box', 'https://images.unsplash.com/photo-1528732263440-4dd1a18a4cc2?w=600&auto=format&fit=crop&q=80', 'Must be kept cold during transit. Chilled ice gel packs provided.', 'AVAILABLE', 'FR-BAN-4821', NULL, NULL, datetime('now', '-2 hours')),
            (13, 5, 'Crisp Salad Greens, Tomatoes & Cucumbers', 'Vegetables', 'Washed, diced and fresh salad bar produce packaged in airtight crates.', 22.00, 'kg', 55, datetime('now', '-1 hours'), datetime('now', '+18 hours'), 'Link Road, Andheri West', 'Mumbai', 19.1363, 72.8277, 1, 'None', 'Air-tight Translucent Tubs', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80', 'Counter service desk at ground floor.', 'AVAILABLE', 'FR-AND-3312', NULL, NULL, datetime('now', '-1 hours')),
            (14, 2, 'Vegetable Hakka Noodles & Manchurian', 'Cooked Meals', 'Party order surplus cancelled by host.', 18.00, 'kg', 45, datetime('now', '-10 hours'), datetime('now', '-2 hours'), '14 Shivaji Park Road, Dadar West', 'Mumbai', 19.0280, 72.8397, 1, 'Soy, Wheat', 'Hot Boxes', 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80', 'Self-consumed by staff.', 'CANCELLED', 'FR-CAN-6619', NULL, NULL, datetime('now', '-10 hours')),
            (15, 6, 'Assorted Tea Sandwiches & Fruit Tarts', 'Bakery', 'Afternoon corporate tea spread.', 12.00, 'kg', 30, datetime('now', '-14 hours'), datetime('now', '-4 hours'), 'Gokhale Road, Naupada, Thane West', 'Thane', 19.1860, 72.9759, 1, 'Wheat, Dairy', 'Cardboard Trays', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=600&auto=format&fit=crop&q=80', 'Time passed before claim. Safely diverted to composting unit.', 'EXPIRED', 'FR-EXP-2011', NULL, NULL, datetime('now', '-14 hours'));
        ");

        // Claims & Pickups
        $pdo->exec("
            INSERT OR IGNORE INTO donation_claims (id, donation_id, ngo_id, claim_status, claimed_at, notes) VALUES
            (1, 6, 7, 'ACTIVE', datetime('now', '-30 minutes'), 'Robin Hood Army volunteers mobilizing auto pickup from Dadar.'),
            (2, 7, 8, 'ACTIVE', datetime('now', '-2 hours'), 'Akshaya Foundation refrigerated mini truck dispatched.'),
            (3, 8, 10, 'ACTIVE', datetime('now', '-3 hours'), 'Mumbai Roti Bank collection van en-route to Bandra/Andheri cluster.'),
            (4, 9, 7, 'COMPLETED', datetime('now', '-23 hours'), 'Served 200 hot meals at Dharavi transit camp.'),
            (5, 10, 9, 'COMPLETED', datetime('now', '-46 hours'), 'Breakfast provisions distributed to children home in Ghatkopar.'),
            (6, 11, 10, 'COMPLETED', datetime('now', '-70 hours'), 'Transferred to community food distribution kitchen.');

            INSERT OR IGNORE INTO pickup_records (id, donation_id, ngo_id, scheduled_date, scheduled_time, contact_person, contact_phone, pickup_notes, status, verified_at, completed_at) VALUES
            (1, 6, 7, date('now'), '14:30:00', 'Aakash Verma (RHA Lead)', '+91 98330 99881', 'Team arriving with 4 food grade thermal transport cans.', 'SCHEDULED', NULL, NULL),
            (2, 7, 8, date('now'), '15:30:00', 'Sunil Jadhav (Driver)', '+91 98331 88772', 'Refrigerated van MH-03-BW-4419 reaching in 45 minutes.', 'ARRIVED', NULL, NULL),
            (3, 8, 10, date('now'), '11:00:00', 'Santosh Gaikwad', '+91 98333 77663', 'QR Code successfully verified at loading dock.', 'PICKED_UP', datetime('now', '-45 minutes'), NULL),
            (4, 9, 7, date('now', '-1 day'), '14:30:00', 'Aakash Verma', '+91 98330 99881', 'QR Code scanned and validated on site.', 'COMPLETED', datetime('now', '-22 hours'), datetime('now', '-21 hours')),
            (5, 10, 9, date('now', '-2 day'), '10:00:00', 'Meera Iyer', '+91 98332 66554', 'Handover confirmed with Hostel Warden.', 'COMPLETED', datetime('now', '-45 hours'), datetime('now', '-44 hours')),
            (6, 11, 10, date('now', '-3 day'), '23:30:00', 'Santosh Gaikwad', '+91 98333 77663', 'Late night wedding pickup completed safely.', 'COMPLETED', datetime('now', '-69 hours'), datetime('now', '-68 hours'));

            INSERT OR IGNORE INTO notifications (id, user_id, title, message, type, related_id, is_read, created_at) VALUES
            (1, 2, 'Donation Claimed!', 'Robin Hood Army Mumbai Chapter has claimed your donation: \"Paneer Butter Masala & Jeera Rice\".', 'DONATION_CLAIMED', 6, 0, datetime('now', '-30 minutes')),
            (2, 7, 'Pickup Scheduled', 'Your pickup for donation \"Paneer Butter Masala & Jeera Rice\" is scheduled for Dadar West today.', 'PICKUP_SCHEDULED', 6, 0, datetime('now', '-20 minutes')),
            (3, 3, 'Pickup In Progress', 'Akshaya Food Relief Foundation vehicle has marked arrival at Bandra West.', 'ALERT', 7, 0, datetime('now', '-10 minutes')),
            (4, 5, 'Pickup Successfully Verified', 'QR Handover verified for \"Vegetable Biryani & Boondi Raita\" by Mumbai Roti Bank.', 'PICKUP_VERIFIED', 8, 1, datetime('now', '-45 minutes')),
            (5, 7, 'Donation Completed - Thank You!', 'Donation #9 \"South Indian Meal Feast\" marked as completed. 200 meals rescued!', 'DONATION_COMPLETED', 9, 1, datetime('now', '-21 hours')),
            (6, 1, 'New NGO Verified', 'Hope Children Care & Welfare Trust documentation has been auto-verified.', 'USER_VERIFIED', 11, 1, datetime('now', '-5 days')),
            (7, 8, 'Urgent Donation Nearby!', 'Vegetable Pulao & Mixed Dal Tadka (65 servings) is available 3.2 km away with 3 hours remaining.', 'NEW_DONATION', 1, 0, datetime('now', '-2 hours'));

            INSERT OR IGNORE INTO admin_actions (admin_id, action_type, target_type, target_id, details, created_at) VALUES
            (1, 'VERIFY_USER', 'USER', 2, 'Verified FSSAI license & identity for Annapoorna Catering Services', datetime('now', '-10 days')),
            (1, 'VERIFY_USER', 'USER', 7, 'Verified 80G and NGO Darpan registration for Robin Hood Army Mumbai', datetime('now', '-9 days')),
            (1, 'VERIFY_USER', 'USER', 8, 'Verified registration certificate and cold-chain compliance for Akshaya Foundation', datetime('now', '-8 days')),
            (1, 'AUDIT_DONATION', 'DONATION', 9, 'Verified impact metric of 200 meals recorded for community audit', datetime('now', '-1 day'));
        ");
    }

    public static function getDriver(): string {
        return self::$driver;
    }
}
