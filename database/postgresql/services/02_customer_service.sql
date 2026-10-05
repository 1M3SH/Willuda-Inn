-- =========================================================
-- POSTGRESQL SERVICE 2: CUSTOMER SERVICE
-- Table: customers
-- =========================================================

CREATE TABLE IF NOT EXISTS customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO customers (id, full_name, email, phone, address, status, created_at) VALUES
(1,  'Amal Perera',         'amal.perera@example.com',         '0771234501', '12 Lake Road, Colombo',         'Active',  '2026-01-05 09:15:00+00'),
(2,  'Nadeesha Silva',      'nadeesha.silva@example.com',      '0711234502', '45 Temple Street, Kandy',       'Active',  '2026-01-12 10:30:00+00'),
(3,  'Kavindu Fernando',    'kavindu.fernando@example.com',    '0751234503', '18 Beach Avenue, Galle',        'Active',  '2026-01-19 11:20:00+00'),
(4,  'Sewwandi Kumari',     'sewwandi.kumari@example.com',     '0761234504', '77 Green Lane, Matara',         'Active',  '2026-02-02 08:45:00+00'),
(5,  'Ravindu Jayasena',    'ravindu.jayasena@example.com',    '0701234505', '23 Station Road, Kurunegala',   'Active',  '2026-02-11 14:10:00+00'),
(6,  'Thilini Madushika',   'thilini.madushika@example.com',   '0771234506', '10 Palm Garden, Negombo',       'Active',  '2026-02-18 15:00:00+00'),
(7,  'Dulanjali Perera',    'dulanjali.perera@example.com',    '0711234507', '61 Hill Street, Nuwara Eliya',  'Active',  '2026-03-03 09:40:00+00'),
(8,  'Chathura Bandara',    'chathura.bandara@example.com',    '0751234508', '30 Main Street, Anuradhapura',  'Active',  '2026-03-15 12:25:00+00'),
(9,  'Pabasara Weerasinghe','pabasara.weerasinghe@example.com','0761234509', '28 River Road, Ratnapura',       'Blocked', '2026-03-24 16:05:00+00'),
(10, 'Isuru Dissanayake',   'isuru.dissanayake@example.com',   '0701234510', '52 Market Road, Badulla',       'Active',  '2026-04-01 10:50:00+00'),
(11, 'Hansani Rodrigo',     'hansani.rodrigo@example.com',     '0771234511', '15 Church Road, Negombo',       'Active',  '2026-04-16 13:35:00+00'),
(12, 'Vihanga Lakmal',      'vihanga.lakmal@example.com',      '0711234512', '42 New Town, Hambantota',       'Active',  '2026-05-04 09:05:00+00'),
(13, 'Madhushi Wickrama',   'madhushi.wickrama@example.com',   '0751234513', '36 Park Avenue, Colombo',       'Active',  '2026-05-21 17:20:00+00'),
(14, 'Supun Karunaratne',   'supun.karunaratne@example.com',   '0761234514', '84 School Lane, Kegalle',       'Blocked', '2026-06-07 08:30:00+00'),
(15, 'Dewmini Senarath',    'dewmini.senarath@example.com',    '0701234515', '19 Flower Road, Colombo',       'Active',  '2026-06-25 11:45:00+00')
ON CONFLICT (email) DO NOTHING;

SELECT setval('customers_id_seq', COALESCE((SELECT MAX(id) FROM customers), 1));

SELECT 'customers' AS service_table, COUNT(*) AS count FROM customers;
