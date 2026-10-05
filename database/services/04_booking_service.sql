-- =========================================================
-- SERVICE 4: BOOKING & RESERVATION SERVICE DATABASE
-- Target Table: bookings
-- Purpose: Room and suite reservations, stay duration, and guest counts
-- =========================================================

CREATE DATABASE IF NOT EXISTS willuda_inn
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE willuda_inn;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------
-- Table Structure
-- ---------------------------------------------------------

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

-- ---------------------------------------------------------
-- Seed Data (Safe Idempotent Insert)
-- ---------------------------------------------------------

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

DROP TEMPORARY TABLE IF EXISTS seed_bookings;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification
SELECT 'bookings' AS service_table, COUNT(*) AS record_count FROM bookings;
