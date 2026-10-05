-- =========================================================
-- SERVICE 3: FACILITY & INVENTORY SERVICE DATABASE
-- Target Table: facilities
-- Purpose: Suites, hotel rooms, event halls, pricing, and availability
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

-- ---------------------------------------------------------
-- Seed Data (Safe Idempotent Insert)
-- ---------------------------------------------------------

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

DROP TEMPORARY TABLE IF EXISTS seed_facilities;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification
SELECT 'facilities' AS service_table, COUNT(*) AS record_count FROM facilities;
