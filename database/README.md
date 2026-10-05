# Willuda Inn - Modular Database Architecture

This directory contains the database setup scripts for Willuda Inn, modularized into **6 independent service databases** as well as a single all-in-one file.

---

## Service Database Breakdown

| File | Target Service | Core Table | Description |
| :--- | :--- | :--- | :--- |
| **`01_auth_service.sql`** | Authentication Service | `admins` | Administrative and staff user credentials, roles, and status. |
| **`02_customer_service.sql`** | Customer Profile Service | `customers` | Guest information, contact phone, addresses, and statuses. |
| **`03_facility_service.sql`** | Facility & Inventory Service | `facilities` | Hotel rooms, suites, event halls, pricing, and locations. |
| **`04_booking_service.sql`** | Booking & Reservation Service | `bookings` | Guest reservations, check-in/out dates, and payment totals. |
| **`05_event_service.sql`** | Event Management Service | `events` | Banquets, weddings, conferences, guest counts, and schedules. |
| **`06_payment_service.sql`** | Payment & Billing Service | `payments` | Transaction references, billing methods, and receipt records. |

---

## How to Run & Import

### Option 1: Import a Single Service (Completely Independent)
To initialize or refresh a specific service alone:
```bash
mysql -u root -p willuda_inn < database/services/01_auth_service.sql
```

### Option 2: Import All Services Modularly
Run the sequential initializer inside MySQL:
```bash
cd database/services
mysql -u root -p willuda_inn < init_all.sql
```

### Option 3: All-in-One Import
Use the root database file:
```bash
mysql -u root -p willuda_inn < database/database.sql
```

---

## Seed Data & Idempotence
Each service file is **idempotent**:
- Running a script multiple times will **not** duplicate data or fail with primary key errors.
- Existing operational data is preserved.
- Missing demo records are automatically filled to ensure at least 15 verified records per service.
