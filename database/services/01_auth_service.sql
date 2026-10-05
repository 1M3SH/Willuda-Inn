-- =========================================================
-- SERVICE 1: AUTHENTICATION SERVICE DATABASE
-- Target Table: admins
-- Purpose: Administrator and staff credentials, roles, and status
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

CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Administrator',
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- Seed Data (Safe Idempotent Insert)
-- ---------------------------------------------------------

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

DROP TEMPORARY TABLE IF EXISTS seed_admins;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification
SELECT 'admins' AS service_table, COUNT(*) AS record_count FROM admins;
