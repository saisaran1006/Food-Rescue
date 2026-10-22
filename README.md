# 🌿 FoodRescue – Smart Surplus Food Redistribution & Donation Platform

FoodRescue is a full-stack surplus food redistribution and donation management web application designed to eliminate edible food wastage and connect surplus food donors (restaurants, hotels, hostels, event organizers, cafeterias, and households) with verified NGOs and community organizations.

---

## 🌟 Key Differentiating Features

1. **Smart Donation Matching Engine (Rule-Based)**:
   - Evaluates compatibility based on **Distance Suitability (30%)**, **Food Category Compatibility (30%)**, **NGO Serving Capacity (20%)**, **Food Urgency Priority (15%)**, and **Immediate Pickup Availability (5%)**.
   - Displays clear, honest, plain-language explanations on recommended cards (e.g., *"Recommended because this donation is 2.1 km away, matches your accepted food category (Cooked Meals), and fits your serving capacity of 350 meals"*).

2. **Automated Food Urgency Detection**:
   - Categorizes listings based on consumption deadline:
     - `NORMAL`: More than 12 hours remaining
     - `SOON`: 6–12 hours remaining
     - `URGENT`: 2–6 hours remaining
     - `CRITICAL`: Less than 2 hours remaining (pulsing visual alert)
     - `EXPIRED`: Past deadline (automatically locked from claiming)

3. **Digital QR Code Handover Verification**:
   - Generates unique cryptographic verification codes (e.g. `FR-DAD-8841`) and live QR codes for every donation.
   - Collecting NGO volunteer scans or enters the code upon arrival at the donor's facility to verify handover and update status to `PICKED_UP`. Prevents code reuse or unauthorized claims.

4. **Multi-Role Dashboards & Role-Based Access Control**:
   - **DONOR Module**: Post surplus food with hygiene/allergen details, manage active batches, track pickups, view rescued meals metrics.
   - **NGO Module**: Discover available surplus on interactive OpenStreetMap, receive smart matches, claim batches with race-condition prevention, coordinate drivers.
   - **ADMIN Portal**: User verification & moderation (Verify, Reject, Suspend, Reactivate), audit trails, donation monitoring, and analytics.

5. **Interactive Map Feature**:
   - Embedded OpenStreetMap powered by Leaflet, displaying color-coded markers for food donations according to urgency, with popup cards and one-click claiming.

6. **In-App Notification Center**:
   - Real-time unread counter badge, alert dropdown, and chronological notification feed for claims, driver arrivals, and handover confirmations.

7. **Food Rescue Impact & Environmental Metrics**:
   - Live public and private dashboards tracking **Total Meals Rescued**, **Food Weight Diverted (kg)**, **CO₂ Emissions Prevented (kg CO₂e)**, and **Embedded Water Footprint Conserved (Litres)**.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite 5, React Router 7, Axios, Lucide React, Leaflet, QRCode.react, Vanilla CSS3 Design System.
- **Backend**: PHP 8.2+ REST-style API, Token-based JWT Authentication (HMAC-SHA256), Prepared PDO SQL Statements, Role-based Middleware.
- **Database**: MySQL (with automatic local SQLite fallback for out-of-the-box zero-setup execution).

---

## 📁 Project Structure

```
FOOD RESCUE/
├── frontend/                     # React Vite Single Page Application
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Navbar.jsx        # Responsive navigation with notifications
│   │   │   ├── Footer.jsx        # Platform footer
│   │   │   ├── ProtectedRoute.jsx# Role guard (DONOR, NGO, ADMIN)
│   │   │   ├── DonationCard.jsx  # Food cards with veg/non-veg & distance
│   │   │   ├── DonationMap.jsx   # Leaflet OpenStreetMap view
│   │   │   ├── QRHandoverModal.jsx # Dynamic QR generation & verification
│   │   │   ├── StatusBadge.jsx   # Status and Urgency badges
│   │   │   └── Timeline.jsx      # 5-step lifecycle progress
│   │   ├── pages/
│   │   │   ├── Home.jsx          # Hero, workflow, impact counters
│   │   │   ├── HowItWorks.jsx    # Step-by-step protocol guide
│   │   │   ├── Impact.jsx        # Public impact & environmental dashboard
│   │   │   ├── Login.jsx         # Login with 1-click demo accounts
│   │   │   ├── Register.jsx      # Donor & NGO registration
│   │   │   ├── DonationDetails.jsx # 5-step timeline, pickup coordination
│   │   │   ├── Profile.jsx       # Organization profile & impact history
│   │   │   ├── ChangePassword.jsx# Password update
│   │   │   ├── Notifications.jsx # Notification center
│   │   │   ├── donor/            # Donor dashboard, post donation, my donations
│   │   │   ├── ngo/              # NGO dashboard, find food, smart matches, claims
│   │   │   └── admin/            # Admin dashboard, users, donations, analytics
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Auth provider & session persistence
│   │   ├── services/
│   │   │   └── api.js            # Axios client with interceptors
│   │   ├── index.css             # Design tokens, variables & typography
│   │   └── App.jsx               # Route definitions
│   └── package.json
│
├── backend/                      # PHP REST API
│   ├── api/
│   │   ├── auth/                 # register, login, me, change-password, logout
│   │   ├── donations/            # create, list, details, claim, cancel, recommended
│   │   ├── pickups/              # schedule, update-status, verify (QR code)
│   │   ├── notifications/        # list, read
│   │   ├── users/                # profile, impact
│   │   └── admin/                # dashboard, analytics, users, verify-user, audit-logs
│   ├── config/
│   │   ├── config.php            # App settings, distance & urgency formulas
│   │   ├── cors.php              # CORS preflight & headers
│   │   └── database.php          # PDO connection (MySQL + auto SQLite fallback)
│   ├── middleware/
│   │   └── auth.php              # HMAC-SHA256 JWT validation & role check
│   ├── uploads/                  # Secure food image directory
│   └── router.php                # PHP built-in server router
│
├── database/
│   ├── schema.sql                # Complete MySQL DDL schema
│   ├── seed.sql                  # Seed data with 1 Admin, 5 Donors, 5 NGOs, 15 Batches
│   └── foodrescue.sqlite         # Pre-seeded instant SQLite database
└── README.md
```

---

## 🔑 Demo Accounts Credentials

All demo accounts use the standard password: **`Password@123`**
*(The login page also provides 1-Click Fast Login buttons for immediate testing!)*

| Role | Account Name | Email | Password |
|---|---|---|---|
| **ADMIN** | System Administrator | `admin@foodrescue.org` | `Password@123` |
| **DONOR** | Chef Rajesh (Annapoorna Catering) | `annapoorna@gmail.com` | `Password@123` |
| **DONOR** | Priya Merchant (Grand Residency Hotel) | `grandresidency@hotel.com` | `Password@123` |
| **DONOR** | Prof. Arvind Kulkarni (Green Valley Hostel) | `hostel@greenvalley.edu` | `Password@123` |
| **DONOR** | Sanjay Deshmukh (Spice Garden Restaurant) | `spicegarden@restaurant.com` | `Password@123` |
| **DONOR** | Manish Mehta (Royal Celebrations Banquets) | `royalcelebrations@banquets.com` | `Password@123` |
| **NGO** | Robin Hood Army Mumbai Chapter | `rha.mumbai@robinhoodarmy.com` | `Password@123` |
| **NGO** | Akshaya Food Relief Foundation | `akshaya@relief.org` | `Password@123` |
| **NGO** | Feeding Smiles Foundation | `contact@feedingsmiles.org` | `Password@123` |
| **NGO** | Mumbai Roti Bank Trust | `operations@mumbairotibank.org` | `Password@123` |
| **NGO** | Hope Children Care & Welfare Trust | `support@hopewelfare.org` | `Password@123` |

---

## 🚀 How to Run the Platform

### Option A: Using the Installed Portable Runtimes (Recommended)

1. **Start the PHP Backend**:
   In PowerShell or Terminal from the project root:
   ```powershell
   $env:PATH = "C:\Users\saisa\tools\node;C:\Users\saisa\tools\php;$env:PATH"
   php -S 127.0.0.1:8000 backend/router.php
   ```
   *The backend will run at `http://127.0.0.1:8000`. If MySQL is active, it connects to MySQL; otherwise, it automatically utilizes the embedded SQLite database with identical tables and seed data.*

2. **Start the React Frontend**:
   In a separate PowerShell or Terminal window:
   ```powershell
   $env:PATH = "C:\Users\saisa\tools\node;C:\Users\saisa\tools\php;$env:PATH"
   cd frontend
   npm run dev
   ```
   *The frontend will run at `http://localhost:5173` with automatic API proxying to `http://127.0.0.1:8000`.*

3. Open your browser and navigate to:
   **`http://localhost:5173`**

---

### Option B: Running with XAMPP / Native MySQL

1. Import `database/schema.sql` and `database/seed.sql` into your MySQL server (via phpMyAdmin or MySQL CLI):
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p < database/seed.sql
   ```
2. Configure credentials in `backend/config/config.php` or set environment variables:
   - `DB_HOST=127.0.0.1`
   - `DB_USER=root`
   - `DB_PASS=`
   - `DB_NAME=foodrescue`
3. Launch the PHP API and Vite frontend as described above.

---

## 📡 API Overview

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `POST` | `/api/auth/register.php` | Register Donor or NGO | Public |
| `POST` | `/api/auth/login.php` | Authenticate & issue token | Public |
| `GET` | `/api/auth/me.php` | Current user & profile info | Authenticated |
| `POST` | `/api/auth/change-password.php` | Update user password | Authenticated |
| `POST` | `/api/donations/create.php` | Post surplus food batch | DONOR, ADMIN |
| `GET` | `/api/donations/list.php` | Query donations with filters | Public / Auth |
| `GET` | `/api/donations/details.php?id={id}` | Full donation & timeline | Public / Auth |
| `POST` | `/api/donations/claim.php` | Atomic claim donation | NGO, ADMIN |
| `POST` | `/api/donations/cancel.php` | Cancel donation batch | DONOR, ADMIN |
| `GET` | `/api/donations/recommended.php` | Smart compatibility match | NGO, ADMIN |
| `POST` | `/api/pickups/schedule.php` | Schedule pickup slot & contact | NGO, ADMIN |
| `POST` | `/api/pickups/verify.php` | QR Handover verification | NGO, DONOR, ADMIN |
| `POST` | `/api/pickups/update-status.php` | Mark ARRIVED or COMPLETED | NGO, DONOR, ADMIN |
| `GET` | `/api/notifications/list.php` | List user notifications | Authenticated |
| `POST` | `/api/notifications/read.php` | Mark notification read | Authenticated |
| `GET` | `/api/users/profile.php` | View user profile & impact | Authenticated |
| `POST` | `/api/users/profile.php` | Update profile attributes | Authenticated |
| `GET` | `/api/users/impact.php` | Platform & role impact stats | Public / Auth |
| `GET` | `/api/admin/dashboard.php` | Admin overview metrics | ADMIN |
| `GET` | `/api/admin/analytics.php` | Chart analytics & trends | ADMIN |
| `GET` | `/api/admin/users.php` | User moderation list | ADMIN |
| `POST` | `/api/admin/verify-user.php` | Approve/Suspend/Reject user | ADMIN |
| `GET` | `/api/admin/audit-logs.php` | Immutable administrative ledger | ADMIN |
