-- =========================================================
-- WILLUDA INN - COMPLETE DATABASE.SQL
-- 6 tables with 15 records in each table
-- MySQL 8.0+
--
-- Tables:
--   1. admins
--   2. customers
--   3. facilities
--   4. bookings
--   5. events
--   6. payments
--
-- This script is designed to work with the current Willuda Inn project.
-- It does not delete existing application data.
-- It adds only the missing demo records required to reach 15 records.
-- =========================================================

CREATE DATABASE IF NOT EXISTS willuda_inn
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE willuda_inn;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- =========================================================
-- TABLE 1: ADMINS
-- =========================================================

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Administrator',
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TEMPORARY TABLE IF EXISTS seed_admins;

CREATE TEMPORARY TABLE seed_admins (
    seed_no INT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(120),
    password VARCHAR(255),
    role VARCHAR(50),
    status VARCHAR(20)
);

INSERT INTO seed_admins VALUES
(1,  'Prabhath Akalanka',   'admin@willudainn.com',           'Willuda@123', 'Administrator', 'Active'),
(2,  'Nimali Perera',       'nimali.admin@willudainn.com',    'Willuda@123', 'Manager',       'Active'),
(3,  'Kasun Silva',         'kasun.admin@willudainn.com',     'Willuda@123', 'Receptionist',  'Active'),
(4,  'Tharushi Fernando',   'tharushi.admin@willudainn.com',  'Willuda@123', 'Event Manager', 'Active'),
(5,  'Dinesh Jayawardena',  'dinesh.admin@willudainn.com',    'Willuda@123', 'Accountant',    'Active'),
(6,  'Sachini Gunawardena', 'sachini.admin@willudainn.com',   'Willuda@123', 'Receptionist',  'Active'),
(7,  'Ruwan Bandara',       'ruwan.admin@willudainn.com',     'Willuda@123', 'Manager',       'Active'),
(8,  'Ishara Senanayake',   'ishara.admin@willudainn.com',    'Willuda@123', 'Event Manager', 'Active'),
(9,  'Malith Wijesinghe',   'malith.admin@willudainn.com',    'Willuda@123', 'Accountant',    'Active'),
(10, 'Dinithi Rathnayake',  'dinithi.admin@willudainn.com',   'Willuda@123', 'Receptionist',  'Active'),
(11, 'Chamod Ekanayake',    'chamod.admin@willudainn.com',    'Willuda@123', 'Manager',       'Active'),
(12, 'Piumi Madushani',     'piumi.admin@willudainn.com',     'Willuda@123', 'Event Manager', 'Active'),
(13, 'Lahiru Dissanayake',  'lahiru.admin@willudainn.com',    'Willuda@123', 'Accountant',    'Active'),
(14, 'Hasini Abeysekara',   'hasini.admin@willudainn.com',    'Willuda@123', 'Receptionist',  'Active'),
(15, 'Sahan Karunaratne',   'sahan.admin@willudainn.com',     'Willuda@123', 'Manager',       'Inactive');

SET @admins_needed := GREATEST(15 - (SELECT COUNT(*) FROM admins), 0);

INSERT INTO admins
    (full_name, email, password, role, status)
SELECT
    full_name,
    email,
    password,
    role,
    status
FROM (
    SELECT
        s.*,
        ROW_NUMBER() OVER (ORDER BY s.seed_no) AS missing_row_number
    FROM seed_admins s
    WHERE NOT EXISTS (
        SELECT 1
        FROM admins a
        WHERE LOWER(a.email) = LOWER(s.email)
    )
) AS missing_admins
WHERE missing_row_number <= @admins_needed;

-- =========================================================
-- TABLE 2: CUSTOMERS
-- Matches the current customer backend structure.
-- =========================================================

CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TEMPORARY TABLE IF EXISTS seed_customers;

CREATE TEMPORARY TABLE seed_customers (
    seed_no INT PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    status VARCHAR(20),
    created_at DATETIME
);

INSERT INTO seed_customers VALUES
(1,  'Amal Perera',         'amal.perera@example.com',         '0771234501', '12 Lake Road, Colombo',         'Active',  '2026-01-05 09:15:00'),
(2,  'Nadeesha Silva',      'nadeesha.silva@example.com',      '0711234502', '45 Temple Street, Kandy',       'Active',  '2026-01-12 10:30:00'),
(3,  'Kavindu Fernando',    'kavindu.fernando@example.com',    '0751234503', '18 Beach Avenue, Galle',        'Active',  '2026-01-19 11:20:00'),
(4,  'Sewwandi Kumari',     'sewwandi.kumari@example.com',     '0761234504', '77 Green Lane, Matara',         'Active',  '2026-02-02 08:45:00'),
(5,  'Ravindu Jayasena',    'ravindu.jayasena@example.com',    '0701234505', '23 Station Road, Kurunegala',   'Active',  '2026-02-11 14:10:00'),
(6,  'Thilini Madushika',   'thilini.madushika@example.com',   '0771234506', '10 Palm Garden, Negombo',       'Active',  '2026-02-18 15:00:00'),
(7,  'Dulanjali Perera',    'dulanjali.perera@example.com',    '0711234507', '61 Hill Street, Nuwara Eliya',  'Active',  '2026-03-03 09:40:00'),
(8,  'Chathura Bandara',    'chathura.bandara@example.com',    '0751234508', '30 Main Street, Anuradhapura',  'Active',  '2026-03-15 12:25:00'),
(9,  'Pabasara Weerasinghe','pabasara.weerasinghe@example.com','0761234509', '28 River Road, Ratnapura',       'Blocked', '2026-03-24 16:05:00'),
(10, 'Isuru Dissanayake',   'isuru.dissanayake@example.com',   '0701234510', '52 Market Road, Badulla',       'Active',  '2026-04-01 10:50:00'),
(11, 'Hansani Rodrigo',     'hansani.rodrigo@example.com',     '0771234511', '15 Church Road, Negombo',       'Active',  '2026-04-16 13:35:00'),
(12, 'Vihanga Lakmal',      'vihanga.lakmal@example.com',      '0711234512', '42 New Town, Hambantota',       'Active',  '2026-05-04 09:05:00'),
(13, 'Madhushi Wickrama',   'madhushi.wickrama@example.com',   '0751234513', '36 Park Avenue, Colombo',       'Active',  '2026-05-21 17:20:00'),
(14, 'Supun Karunaratne',   'supun.karunaratne@example.com',   '0761234514', '84 School Lane, Kegalle',       'Blocked', '2026-06-07 08:30:00'),
(15, 'Dewmini Senarath',    'dewmini.senarath@example.com',    '0701234515', '19 Flower Road, Colombo',       'Active',  '2026-06-25 11:45:00');

SET @customers_needed := GREATEST(15 - (SELECT COUNT(*) FROM customers), 0);

INSERT INTO customers
    (full_name, email, phone, address, status, created_at)
SELECT
    full_name,
    email,
    phone,
    address,
    status,
    created_at
FROM (
    SELECT
        s.*,
        ROW_NUMBER() OVER (ORDER BY s.seed_no) AS missing_row_number
    FROM seed_customers s
    WHERE NOT EXISTS (
        SELECT 1
        FROM customers c
        WHERE LOWER(c.email) = LOWER(s.email)
    )
) AS missing_customers
WHERE missing_row_number <= @customers_needed;

-- =========================================================
-- TABLE 3: FACILITIES
-- =========================================================

CREATE TABLE IF NOT EXISTS facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facility_name VARCHAR(120) NOT NULL,
    facility_type VARCHAR(60) NOT NULL,
    location VARCHAR(150),
    capacity INT DEFAULT 1,
    price DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Available',
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE facilities
    ADD COLUMN IF NOT EXISTS location VARCHAR(150) NULL,
    ADD COLUMN IF NOT EXISTS capacity INT DEFAULT 1,
    ADD COLUMN IF NOT EXISTS description TEXT NULL,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

DROP TEMPORARY TABLE IF EXISTS seed_facilities;

CREATE TEMPORARY TABLE seed_facilities (
    seed_no INT PRIMARY KEY,
    facility_name VARCHAR(120),
    facility_type VARCHAR(60),
    location VARCHAR(150),
    capacity INT,
    price DECIMAL(12,2),
    status VARCHAR(20),
    description TEXT
);

INSERT INTO seed_facilities VALUES
(1,  'Royal Suite',          'Suite',            'East Wing - Level 3',   2,   35000.00,  'Available',   'Luxury suite with a private balcony.'),
(2,  'Deluxe Garden Room',   'Room',             'Garden Wing - Level 1', 2,   22000.00,  'Available',   'Comfortable room overlooking the garden.'),
(3,  'Family Suite',         'Suite',            'West Wing - Level 2',   5,   42000.00,  'Booked',      'Spacious suite designed for families.'),
(4,  'Ocean View Room',      'Room',             'South Wing - Level 4',  2,   28000.00,  'Available',   'Room with a panoramic ocean view.'),
(5,  'Executive Room',       'Room',             'East Wing - Level 2',   2,   26000.00,  'Available',   'Business-friendly room with work area.'),
(6,  'Grand Ballroom',       'Hall',             'Ground Floor',         300, 150000.00, 'Booked',      'Large ballroom for weddings and galas.'),
(7,  'Lotus Banquet Hall',   'Hall',             'Ground Floor',         150, 95000.00,  'Available',   'Banquet hall for private celebrations.'),
(8,  'Sapphire Conference',  'Conference Space', 'Level 1',               80, 65000.00,  'Available',   'Conference room with multimedia equipment.'),
(9,  'Emerald Meeting Room', 'Conference Space', 'Level 1',               25, 30000.00,  'Available',   'Meeting room for small corporate teams.'),
(10, 'Sunset Event Garden',  'Event Space',      'Outdoor Garden',       200, 85000.00,  'Available',   'Outdoor garden for evening events.'),
(11, 'Poolside Pavilion',    'Event Space',      'Pool Area',            120, 75000.00,  'Maintenance', 'Poolside venue for receptions.'),
(12, 'Willuda Restaurant',   'Restaurant',       'Ground Floor',         100, 50000.00,  'Available',   'Restaurant space for group dining.'),
(13, 'Lotus Spa',            'Spa',              'Level 2',               20, 5000.00,   'Maintenance', 'Spa and wellness treatment area.'),
(14, 'Rooftop Lounge',       'Event Space',      'Rooftop',               90, 70000.00,  'Available',   'Rooftop lounge with city views.'),
(15, 'Presidential Suite',   'Suite',            'East Wing - Level 5',   4,  65000.00,  'Available',   'Premium suite with exclusive amenities.');

SET @facilities_needed := GREATEST(15 - (SELECT COUNT(*) FROM facilities), 0);

INSERT INTO facilities
    (facility_name, facility_type, location, capacity, price, status, description)
SELECT
    facility_name,
    facility_type,
    location,
    capacity,
    price,
    status,
    description
FROM (
    SELECT
        s.*,
        ROW_NUMBER() OVER (ORDER BY s.seed_no) AS missing_row_number
    FROM seed_facilities s
    WHERE NOT EXISTS (
        SELECT 1
        FROM facilities f
        WHERE LOWER(f.facility_name) = LOWER(s.facility_name)
    )
) AS missing_facilities
WHERE missing_row_number <= @facilities_needed;

-- =========================================================
-- TABLE 4: BOOKINGS
-- Matches the current booking backend structure.
-- =========================================================

CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    room_type VARCHAR(50),
    check_in DATE,
    check_out DATE,
    guests INT,
    total_price DECIMAL(10,2),
    status VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TEMPORARY TABLE IF EXISTS seed_bookings;

CREATE TEMPORARY TABLE seed_bookings (
    seed_no INT PRIMARY KEY,
    customer_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    room_type VARCHAR(50),
    check_in DATE,
    check_out DATE,
    guests INT,
    total_price DECIMAL(10,2),
    status VARCHAR(50)
);

INSERT INTO seed_bookings VALUES
(1,  'Amal Perera',         'amal.perera@example.com',         '0771234501', 'Royal Suite',          '2026-08-05', '2026-08-07', 2,   70000.00,  'Confirmed'),
(2,  'Nadeesha Silva',      'nadeesha.silva@example.com',      '0711234502', 'Deluxe Garden Room',   '2026-08-08', '2026-08-10', 2,   44000.00,  'Confirmed'),
(3,  'Kavindu Fernando',    'kavindu.fernando@example.com',    '0751234503', 'Family Suite',         '2026-08-12', '2026-08-15', 4,  126000.00,  'Pending'),
(4,  'Sewwandi Kumari',     'sewwandi.kumari@example.com',     '0761234504', 'Ocean View Room',      '2026-08-18', '2026-08-20', 2,   56000.00,  'Confirmed'),
(5,  'Ravindu Jayasena',    'ravindu.jayasena@example.com',    '0701234505', 'Executive Room',       '2026-08-22', '2026-08-24', 2,   52000.00,  'Pending'),
(6,  'Thilini Madushika',   'thilini.madushika@example.com',   '0771234506', 'Grand Ballroom',       '2026-08-28', '2026-08-28', 250,150000.00, 'Confirmed'),
(7,  'Dulanjali Perera',    'dulanjali.perera@example.com',    '0711234507', 'Lotus Banquet Hall',   '2026-09-02', '2026-09-02', 120, 95000.00, 'Pending'),
(8,  'Chathura Bandara',    'chathura.bandara@example.com',    '0751234508', 'Sapphire Conference',  '2026-09-05', '2026-09-05', 70,  65000.00,  'Confirmed'),
(9,  'Pabasara Weerasinghe','pabasara.weerasinghe@example.com','0761234509', 'Emerald Meeting Room', '2026-09-09', '2026-09-09', 20,  30000.00,  'Cancelled'),
(10, 'Isuru Dissanayake',   'isuru.dissanayake@example.com',   '0701234510', 'Sunset Event Garden',  '2026-09-15', '2026-09-15', 160, 85000.00, 'Confirmed'),
(11, 'Hansani Rodrigo',     'hansani.rodrigo@example.com',     '0771234511', 'Poolside Pavilion',    '2026-09-20', '2026-09-20', 90,  75000.00,  'Pending'),
(12, 'Vihanga Lakmal',      'vihanga.lakmal@example.com',      '0711234512', 'Willuda Restaurant',   '2026-10-02', '2026-10-02', 80,  50000.00,  'Confirmed'),
(13, 'Madhushi Wickrama',   'madhushi.wickrama@example.com',   '0751234513', 'Lotus Spa',            '2026-10-10', '2026-10-10', 2,   10000.00,  'Completed'),
(14, 'Supun Karunaratne',   'supun.karunaratne@example.com',   '0761234514', 'Rooftop Lounge',       '2026-10-18', '2026-10-18', 70,  70000.00,  'Pending'),
(15, 'Dewmini Senarath',    'dewmini.senarath@example.com',    '0701234515', 'Presidential Suite',   '2026-11-01', '2026-11-04', 3,  195000.00, 'Confirmed');

SET @bookings_needed := GREATEST(15 - (SELECT COUNT(*) FROM bookings), 0);

INSERT INTO bookings
    (customer_name, email, phone, room_type, check_in, check_out, guests, total_price, status)
SELECT
    customer_name,
    email,
    phone,
    room_type,
    check_in,
    check_out,
    guests,
    total_price,
    status
FROM (
    SELECT
        s.*,
        ROW_NUMBER() OVER (ORDER BY s.seed_no) AS missing_row_number
    FROM seed_bookings s
    WHERE NOT EXISTS (
        SELECT 1
        FROM bookings b
        WHERE LOWER(COALESCE(b.email, '')) = LOWER(s.email)
          AND b.check_in = s.check_in
          AND LOWER(COALESCE(b.room_type, '')) = LOWER(s.room_type)
    )
) AS missing_bookings
WHERE missing_row_number <= @bookings_needed;

-- =========================================================
-- Create row-number mappings for foreign keys.
-- =========================================================

DROP TEMPORARY TABLE IF EXISTS map_customers;
DROP TEMPORARY TABLE IF EXISTS map_facilities;
DROP TEMPORARY TABLE IF EXISTS map_bookings;

CREATE TEMPORARY TABLE map_customers AS
SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY id) AS rn
FROM customers
ORDER BY id
LIMIT 15;

CREATE TEMPORARY TABLE map_facilities AS
SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY id) AS rn
FROM facilities
ORDER BY id
LIMIT 15;

CREATE TEMPORARY TABLE map_bookings AS
SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY id) AS rn
FROM bookings
ORDER BY id
LIMIT 15;

-- =========================================================
-- TABLE 5: EVENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NULL,
    facility_id INT NULL,
    event_name VARCHAR(150) NOT NULL,
    event_type VARCHAR(80) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    guest_count INT DEFAULT 1,
    total_amount DECIMAL(12,2) DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'Planned',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_customer (customer_id),
    INDEX idx_event_facility (facility_id),
    CONSTRAINT fk_events_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_events_facility
        FOREIGN KEY (facility_id)
        REFERENCES facilities(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TEMPORARY TABLE IF EXISTS seed_events;

CREATE TEMPORARY TABLE seed_events (
    seed_no INT PRIMARY KEY,
    customer_rn INT,
    facility_rn INT,
    event_name VARCHAR(150),
    event_type VARCHAR(80),
    event_date DATE,
    start_time TIME,
    end_time TIME,
    guest_count INT,
    total_amount DECIMAL(12,2),
    status VARCHAR(20),
    notes TEXT
);

INSERT INTO seed_events VALUES
(1,  1,  6,  'Amal and Hiruni Wedding',         'Wedding',          '2026-08-22', '09:00:00', '22:00:00', 250, 350000.00, 'Confirmed', 'Full wedding package.'),
(2,  2,  7,  'Nadeesha Birthday Celebration',  'Birthday Party',   '2026-08-28', '18:00:00', '23:00:00', 120, 150000.00, 'Planned',   'Birthday decorations required.'),
(3,  3,  8,  'Technology Conference 2026',      'Conference',       '2026-09-03', '08:30:00', '17:30:00', 70,  120000.00, 'Confirmed', 'Projector and lunch buffet.'),
(4,  4,  9,  'Regional Sales Meeting',          'Business Meeting', '2026-09-08', '09:00:00', '15:00:00', 20,   45000.00, 'Cancelled', 'Cancelled by client.'),
(5,  5, 10,  'Sunset Engagement Party',         'Engagement',       '2026-09-15', '17:00:00', '23:00:00', 160, 200000.00, 'Confirmed', 'Outdoor lighting package.'),
(6,  6, 11,  'Poolside Alumni Reunion',         'Reunion',          '2026-09-20', '18:00:00', '23:30:00', 90,  140000.00, 'Planned',   'Live music requested.'),
(7,  7, 12,  'Corporate Dinner Night',          'Corporate Dinner', '2026-10-02', '19:00:00', '22:30:00', 80,  110000.00, 'Confirmed', 'Executive buffet package.'),
(8,  8, 14,  'Rooftop Product Launch',          'Product Launch',   '2026-10-18', '16:00:00', '22:00:00', 70,  160000.00, 'Planned',   'Branding and stage setup.'),
(9,  9,  6,  'Charity Gala Dinner',             'Gala Dinner',      '2026-11-06', '18:30:00', '23:30:00', 280, 400000.00, 'Confirmed', 'Fundraising event.'),
(10, 10, 7,  'School Award Ceremony',           'Award Ceremony',   '2026-11-14', '09:00:00', '15:00:00', 140, 180000.00, 'Planned',   'Stage and certificate table.'),
(11, 11, 8,  'Medical Workshop',                'Workshop',         '2026-11-21', '08:00:00', '17:00:00', 75,  130000.00, 'Confirmed', 'Classroom seating arrangement.'),
(12, 12, 10, 'Cultural Music Evening',          'Music Event',      '2026-12-05', '17:30:00', '22:30:00', 180, 230000.00, 'Planned',   'Outdoor sound system.'),
(13, 13, 12, 'Family Anniversary Dinner',       'Anniversary',      '2026-12-12', '19:00:00', '22:00:00', 45,   85000.00, 'Confirmed', 'Private dining area.'),
(14, 14, 14, 'New Year Business Reception',     'Reception',        '2026-12-30', '18:00:00', '23:59:00', 85,  175000.00, 'Planned',   'Countdown and DJ setup.'),
(15, 15, 6,  'Willuda New Year Gala',           'Gala Dinner',      '2026-12-31', '19:00:00', '23:59:00', 300, 500000.00, 'Confirmed', 'Premium New Year event package.');

SET @events_needed := GREATEST(15 - (SELECT COUNT(*) FROM events), 0);

INSERT INTO events
    (customer_id, facility_id, event_name, event_type, event_date,
     start_time, end_time, guest_count, total_amount, status, notes)
SELECT
    c.id,
    f.id,
    event_name,
    event_type,
    event_date,
    start_time,
    end_time,
    guest_count,
    total_amount,
    status,
    notes
FROM (
    SELECT
        s.*,
        ROW_NUMBER() OVER (ORDER BY s.seed_no) AS missing_row_number
    FROM seed_events s
    WHERE NOT EXISTS (
        SELECT 1
        FROM events e
        WHERE LOWER(e.event_name) = LOWER(s.event_name)
          AND e.event_date = s.event_date
    )
) AS missing_events
JOIN map_customers c
    ON c.rn = missing_events.customer_rn
JOIN map_facilities f
    ON f.rn = missing_events.facility_rn
WHERE missing_row_number <= @events_needed;

-- =========================================================
-- TABLE 6: PAYMENTS
-- =========================================================

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id INT NULL,
    customer_id INT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(40) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    transaction_reference VARCHAR(80),
    payment_date DATETIME,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_payment_booking (booking_id),
    INDEX idx_payment_customer (customer_id),
    CONSTRAINT fk_payments_booking
        FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,
    CONSTRAINT fk_payments_customer
        FOREIGN KEY (customer_id)
        REFERENCES customers(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

DROP TEMPORARY TABLE IF EXISTS seed_payments;

CREATE TEMPORARY TABLE seed_payments (
    seed_no INT PRIMARY KEY,
    booking_rn INT,
    customer_rn INT,
    amount DECIMAL(12,2),
    payment_method VARCHAR(40),
    payment_status VARCHAR(20),
    transaction_reference VARCHAR(80),
    payment_date DATETIME,
    notes TEXT
);

INSERT INTO seed_payments VALUES
(1,  1,  1,  70000.00, 'Credit Card',   'Paid',     'WLI-PAY-00001', '2026-06-20 09:30:00', 'Full payment received.'),
(2,  2,  2,  44000.00, 'Bank Transfer', 'Paid',     'WLI-PAY-00002', '2026-06-24 10:40:00', 'Bank transfer verified.'),
(3,  3,  3,  63000.00, 'Credit Card',   'Partial',  'WLI-PAY-00003', '2026-07-02 11:50:00', 'Fifty percent advance.'),
(4,  4,  4,  56000.00, 'Debit Card',    'Paid',     'WLI-PAY-00004', '2026-07-05 13:00:00', 'Payment completed.'),
(5,  5,  5,  26000.00, 'Cash',          'Partial',  'WLI-PAY-00005', '2026-07-09 14:10:00', 'Advance cash payment.'),
(6,  6,  6,  75000.00, 'Bank Transfer', 'Partial',  'WLI-PAY-00006', '2026-07-12 14:20:00', 'Wedding hall advance.'),
(7,  7,  7,  25000.00, 'Credit Card',   'Partial',  'WLI-PAY-00007', '2026-07-15 15:30:00', 'Event reservation advance.'),
(8,  8,  8,  65000.00, 'Bank Transfer', 'Paid',     'WLI-PAY-00008', '2026-07-18 16:40:00', 'Conference payment received.'),
(9,  9,  9,      0.00, 'Credit Card',   'Refunded', 'WLI-PAY-00009', '2026-07-20 10:00:00', 'Payment refunded after cancellation.'),
(10, 10, 10, 42500.00, 'Debit Card',    'Partial',  'WLI-PAY-00010', '2026-07-22 11:00:00', 'Fifty percent advance.'),
(11, 11, 11, 25000.00, 'Cash',          'Partial',  'WLI-PAY-00011', '2026-07-24 12:10:00', 'Initial reservation payment.'),
(12, 12, 12, 50000.00, 'Credit Card',   'Paid',     'WLI-PAY-00012', '2026-07-26 13:20:00', 'Restaurant booking paid.'),
(13, 13, 13, 10000.00, 'Cash',          'Paid',     'WLI-PAY-00013', '2026-07-28 14:30:00', 'Spa package paid.'),
(14, 14, 14, 35000.00, 'Bank Transfer', 'Partial',  'WLI-PAY-00014', '2026-07-30 15:40:00', 'Rooftop event advance.'),
(15, 15, 15, 97500.00, 'Credit Card',   'Partial',  'WLI-PAY-00015', '2026-08-01 16:50:00', 'Presidential suite advance.');

SET @payments_needed := GREATEST(15 - (SELECT COUNT(*) FROM payments), 0);

INSERT INTO payments
    (booking_id, customer_id, amount, payment_method, payment_status,
     transaction_reference, payment_date, notes)
SELECT
    b.id,
    c.id,
    amount,
    payment_method,
    payment_status,
    transaction_reference,
    payment_date,
    notes
FROM (
    SELECT
        s.*,
        ROW_NUMBER() OVER (ORDER BY s.seed_no) AS missing_row_number
    FROM seed_payments s
    WHERE NOT EXISTS (
        SELECT 1
        FROM payments p
        WHERE p.transaction_reference = s.transaction_reference
    )
) AS missing_payments
JOIN map_bookings b
    ON b.rn = missing_payments.booking_rn
JOIN map_customers c
    ON c.rn = missing_payments.customer_rn
WHERE missing_row_number <= @payments_needed;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- FINAL VERIFICATION
-- Each table should contain 15 records.
-- =========================================================

SELECT 'admins' AS table_name, COUNT(*) AS record_count FROM admins
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'facilities', COUNT(*) FROM facilities
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;

SHOW TABLES;
