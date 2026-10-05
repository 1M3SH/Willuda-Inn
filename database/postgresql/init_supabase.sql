-- =========================================================
-- WILLUDA INN - COMPLETE SUPABASE POSTGRESQL INITIALIZATION
-- Run this complete script in your Supabase SQL Editor.
-- =========================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- 2. CREATE CORE TABLES
-- =========================================================

-- 1. ADMINS & USER AUTH
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Administrator',
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. CUSTOMERS
CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. FACILITIES / ROOMS
CREATE TABLE IF NOT EXISTS facilities (
    id SERIAL PRIMARY KEY,
    facility_name VARCHAR(120) NOT NULL UNIQUE,
    facility_type VARCHAR(60) NOT NULL,
    location VARCHAR(150),
    capacity INT DEFAULT 1,
    price NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    room_type VARCHAR(50),
    check_in DATE,
    check_out DATE,
    guests INT,
    total_price NUMERIC(10,2),
    status VARCHAR(50) DEFAULT 'Pending'
);

-- 5. EVENTS
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    customer_id INT REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
    facility_id INT REFERENCES facilities(id) ON DELETE SET NULL ON UPDATE CASCADE,
    event_name VARCHAR(150) NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    guest_count INT DEFAULT 1,
    total_amount NUMERIC(12,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Planned',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    booking_id INT REFERENCES bookings(id) ON DELETE SET NULL ON UPDATE CASCADE,
    customer_id INT REFERENCES customers(id) ON DELETE SET NULL ON UPDATE CASCADE,
    amount NUMERIC(12,2) NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    transaction_reference VARCHAR(80) UNIQUE,
    payment_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================
-- 3. INDEXES FOR HIGH-PERFORMANCE QUERYING
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_bookings_email ON bookings(email);
CREATE INDEX IF NOT EXISTS idx_events_customer ON events(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer ON payments(customer_id);

-- =========================================================
-- 4. DISABLE RLS FOR BACKEND POOL CONNECTION
-- (Railway backend connects as postgres / service_role)
-- =========================================================

ALTER TABLE IF EXISTS admins DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS facilities DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS events DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS payments DISABLE ROW LEVEL SECURITY;

-- =========================================================
-- 5. DEFAULT SEED DATA (WITH SECURE BCRYPT PASSWORDS)
-- Default password: Willuda@123 -> $2b$10$1t.oymF4zEPvodZfb01UG.Rjg3Ie7HouqD4zspslXrS4zqytfmdYq
-- =========================================================

INSERT INTO admins (id, full_name, email, password, role, status) VALUES
(1,  'Prabhath Akalanka',   'admin@willudainn.com',           '$2b$10$1t.oymF4zEPvodZfb01UG.Rjg3Ie7HouqD4zspslXrS4zqytfmdYq', 'Administrator', 'Active'),
(2,  'Nimali Perera',       'nimali.admin@willudainn.com',    '$2b$10$1t.oymF4zEPvodZfb01UG.Rjg3Ie7HouqD4zspslXrS4zqytfmdYq', 'Manager',       'Active'),
(3,  'Kasun Silva',         'kasun.admin@willudainn.com',     '$2b$10$1t.oymF4zEPvodZfb01UG.Rjg3Ie7HouqD4zspslXrS4zqytfmdYq', 'Receptionist',  'Active'),
(4,  'Tharushi Fernando',   'tharushi.admin@willudainn.com',  '$2b$10$1t.oymF4zEPvodZfb01UG.Rjg3Ie7HouqD4zspslXrS4zqytfmdYq', 'Event Manager', 'Active'),
(5,  'Dinesh Jayawardena',  'dinesh.admin@willudainn.com',    '$2b$10$1t.oymF4zEPvodZfb01UG.Rjg3Ie7HouqD4zspslXrS4zqytfmdYq', 'Accountant',    'Active'),
(6,  'Tharuka Prabathiya',  'tharukaprabathiya833@gmail.com', '$2b$10$/8AqZ8O.QNbWI/rrxpIiDeoNjkOcYVt3hmiObuDZFyKDjMjq3LIEm', 'Customer',     'Active')
ON CONFLICT (email) DO UPDATE SET
    password = EXCLUDED.password,
    role = EXCLUDED.role;

-- Seed Default Facilities
INSERT INTO facilities (id, facility_name, facility_type, location, capacity, price, status, description) VALUES
(1, 'Royal Grand Ballroom',     'Hall',   'Wing A - Level 1', 350, 1850.00, 'Available',   'Luxury ballroom for weddings, galas, and corporate summits.'),
(2, 'Serenade Conference Hall', 'Hall',   'Wing B - Level 2', 120,  750.00, 'Available',   'Equipped with modern audiovisual conferencing setup.'),
(3, 'Emerald Garden Pavilion',  'Garden', 'South Lawn',       200,  950.00, 'Available',   'Scenic outdoor venue for celebrations and dining.'),
(4, 'Presidential Suite 401',   'Room',   'Executive Floor',    4,  420.00, 'Occupied',    'Luxury penthouse suite with panoramic view.'),
(5, 'Deluxe Garden Room 108',   'Room',   'Garden Wing',        2,  180.00, 'Available',   'Quiet room with garden veranda and king bed.'),
(6, 'Executive Business Room 204','Room', 'Central Wing',       2,  220.00, 'Under Maintenance', 'Modern business traveler room with workspace.')
ON CONFLICT (facility_name) DO NOTHING;

-- Seed Default Customers
INSERT INTO customers (id, full_name, email, phone, address, status) VALUES
(1, 'Tharuka Prabathiya', 'tharukaprabathiya833@gmail.com', '+94 77 123 4567', '55/A Kompayahena Road, Godagama, Homagama 10200, Sri Lanka', 'Active'),
(2, 'Kamal Gunaratne',    'kamal.g@gmail.com',             '+94 71 234 5678', 'No 45, Peradeniya Road, Kandy', 'Active'),
(3, 'Sunil Perera',       'sunil.perera@gmail.com',        '+94 76 345 6789', 'No 12, Galle Road, Colombo 03', 'Active')
ON CONFLICT (email) DO NOTHING;

-- Reset Sequences to prevent ID conflicts on future INSERTs
SELECT setval('admins_id_seq', COALESCE((SELECT MAX(id) FROM admins), 1));
SELECT setval('customers_id_seq', COALESCE((SELECT MAX(id) FROM customers), 1));
SELECT setval('facilities_id_seq', COALESCE((SELECT MAX(id) FROM facilities), 1));
SELECT setval('bookings_id_seq', COALESCE((SELECT MAX(id) FROM bookings), 1));
SELECT setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 1));
SELECT setval('payments_id_seq', COALESCE((SELECT MAX(id) FROM payments), 1));

-- Verification query
SELECT
    'admins' AS table_name, COUNT(*) AS row_count FROM admins
UNION ALL
SELECT
    'customers', COUNT(*) FROM customers
UNION ALL
SELECT
    'facilities', COUNT(*) FROM facilities
UNION ALL
SELECT
    'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT
    'events', COUNT(*) FROM events
UNION ALL
SELECT
    'payments', COUNT(*) FROM payments;
