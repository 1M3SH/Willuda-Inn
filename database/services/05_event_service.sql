-- =========================================================
-- SERVICE 5: EVENT MANAGEMENT SERVICE DATABASE
-- Target Table: events
-- Purpose: Weddings, corporate dinners, conferences, and event scheduling
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
    INDEX idx_event_facility (facility_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add foreign keys conditionally if parent tables exist in the same instance
SET @has_customers := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'customers');
SET @has_facilities := (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'facilities');

-- ---------------------------------------------------------
-- Seed Data (Safe Idempotent Insert)
-- ---------------------------------------------------------

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
    COALESCE((SELECT id FROM customers ORDER BY id LIMIT 1 OFFSET s.customer_rn - 1), s.customer_rn),
    COALESCE((SELECT id FROM facilities ORDER BY id LIMIT 1 OFFSET s.facility_rn - 1), s.facility_rn),
    s.event_name,
    s.event_type,
    s.event_date,
    s.start_time,
    s.end_time,
    s.guest_count,
    s.total_amount,
    s.status,
    s.notes
FROM (
    SELECT
        se.*,
        ROW_NUMBER() OVER (ORDER BY se.seed_no) AS missing_row_number
    FROM seed_events se
    WHERE NOT EXISTS (
        SELECT 1
        FROM events e
        WHERE LOWER(e.event_name) = LOWER(se.event_name)
          AND e.event_date = se.event_date
    )
) AS s
WHERE s.missing_row_number <= @events_needed;

DROP TEMPORARY TABLE IF EXISTS seed_events;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification
SELECT 'events' AS service_table, COUNT(*) AS record_count FROM events;
