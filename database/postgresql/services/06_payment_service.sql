-- =========================================================
-- POSTGRESQL SERVICE 6: PAYMENT & BILLING SERVICE
-- Table: payments
-- =========================================================

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

INSERT INTO payments (id, booking_id, customer_id, amount, payment_method, payment_status, transaction_reference, payment_date, notes) VALUES
(1,  1,  1,  70000.00, 'Credit Card',   'Paid',     'WLI-PAY-00001', '2026-06-20 09:30:00+00', 'Full payment received.'),
(2,  2,  2,  44000.00, 'Bank Transfer', 'Paid',     'WLI-PAY-00002', '2026-06-24 10:40:00+00', 'Bank transfer verified.'),
(3,  3,  3,  63000.00, 'Credit Card',   'Partial',  'WLI-PAY-00003', '2026-07-02 11:50:00+00', 'Fifty percent advance.'),
(4,  4,  4,  56000.00, 'Debit Card',    'Paid',     'WLI-PAY-00004', '2026-07-05 13:00:00+00', 'Payment completed.'),
(5,  5,  5,  26000.00, 'Cash',          'Partial',  'WLI-PAY-00005', '2026-07-09 14:10:00+00', 'Advance cash payment.'),
(6,  6,  6,  75000.00, 'Bank Transfer', 'Partial',  'WLI-PAY-00006', '2026-07-12 14:20:00+00', 'Wedding hall advance.'),
(7,  7,  7,  25000.00, 'Credit Card',   'Partial',  'WLI-PAY-00007', '2026-07-15 15:30:00+00', 'Event reservation advance.'),
(8,  8,  8,  65000.00, 'Bank Transfer', 'Paid',     'WLI-PAY-00008', '2026-07-18 16:40:00+00', 'Conference payment received.'),
(9,  9,  9,      0.00, 'Credit Card',   'Refunded', 'WLI-PAY-00009', '2026-07-20 10:00:00+00', 'Payment refunded after cancellation.'),
(10, 10, 10, 42500.00, 'Debit Card',    'Partial',  'WLI-PAY-00010', '2026-07-22 11:00:00+00', 'Fifty percent advance.'),
(11, 11, 11, 25000.00, 'Cash',          'Partial',  'WLI-PAY-00011', '2026-07-24 12:10:00+00', 'Initial reservation payment.'),
(12, 12, 12, 50000.00, 'Credit Card',   'Paid',     'WLI-PAY-00012', '2026-07-26 13:20:00+00', 'Restaurant booking paid.'),
(13, 13, 13, 10000.00, 'Cash',          'Paid',     'WLI-PAY-00013', '2026-07-28 14:30:00+00', 'Spa package paid.'),
(14, 14, 14, 35000.00, 'Bank Transfer', 'Partial',  'WLI-PAY-00014', '2026-07-30 15:40:00+00', 'Rooftop event advance.'),
(15, 15, 15, 97500.00, 'Credit Card',   'Partial',  'WLI-PAY-00015', '2026-08-01 16:50:00+00', 'Presidential suite advance.')
ON CONFLICT (transaction_reference) DO NOTHING;

SELECT setval('payments_id_seq', COALESCE((SELECT MAX(id) FROM payments), 1));

SELECT 'payments' AS service_table, COUNT(*) AS count FROM payments;
