-- =========================================================
-- SERVICE 6: PAYMENT & BILLING SERVICE DATABASE
-- Target Table: payments
-- Purpose: Payment records, billing transactions, methods, and receipt references
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
    INDEX idx_payment_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------
-- Seed Data (Safe Idempotent Insert)
-- ---------------------------------------------------------

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
    COALESCE((SELECT id FROM bookings ORDER BY id LIMIT 1 OFFSET s.booking_rn - 1), s.booking_rn),
    COALESCE((SELECT id FROM customers ORDER BY id LIMIT 1 OFFSET s.customer_rn - 1), s.customer_rn),
    s.amount,
    s.payment_method,
    s.payment_status,
    s.transaction_reference,
    s.payment_date,
    s.notes
FROM (
    SELECT
        sp.*,
        ROW_NUMBER() OVER (ORDER BY sp.seed_no) AS missing_row_number
    FROM seed_payments sp
    WHERE NOT EXISTS (
        SELECT 1
        FROM payments p
        WHERE p.transaction_reference = sp.transaction_reference
    )
) AS s
WHERE s.missing_row_number <= @payments_needed;

DROP TEMPORARY TABLE IF EXISTS seed_payments;

SET FOREIGN_KEY_CHECKS = 1;

-- Verification
SELECT 'payments' AS service_table, COUNT(*) AS record_count FROM payments;
