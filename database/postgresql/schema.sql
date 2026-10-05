-- =========================================================
-- WILLUDA INN - COMPLETE POSTGRESQL DATABASE SCHEMA & SEED
-- Compatible with PostgreSQL 12+
-- =========================================================

-- Create tables

-- 1. ADMINS
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

-- 3. FACILITIES
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
    status VARCHAR(50)
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
-- SEED DATA INSERTION
-- =========================================================

-- Seed Admins
INSERT INTO admins (id, full_name, email, password, role, status) VALUES
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
(15, 'Sahan Karunaratne',   'sahan.admin@willudainn.com',     'Willuda@123', 'Manager',       'Inactive')
ON CONFLICT (email) DO NOTHING;
SELECT setval('admins_id_seq', COALESCE((SELECT MAX(id) FROM admins), 1));

-- Seed Customers
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

-- Seed Facilities
INSERT INTO facilities (id, facility_name, facility_type, location, capacity, price, status, description) VALUES
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
(15, 'Presidential Suite',   'Suite',            'East Wing - Level 5',   4,  65000.00,  'Available',   'Premium suite with exclusive amenities.')
ON CONFLICT (facility_name) DO NOTHING;
SELECT setval('facilities_id_seq', COALESCE((SELECT MAX(id) FROM facilities), 1));

-- Seed Bookings
INSERT INTO bookings (id, customer_name, email, phone, room_type, check_in, check_out, guests, total_price, status) VALUES
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
(15, 'Dewmini Senarath',    'dewmini.senarath@example.com',    '0701234515', 'Presidential Suite',   '2026-11-01', '2026-11-04', 3,  195000.00, 'Confirmed')
ON CONFLICT (id) DO NOTHING;
SELECT setval('bookings_id_seq', COALESCE((SELECT MAX(id) FROM bookings), 1));

-- Seed Events
INSERT INTO events (id, customer_id, facility_id, event_name, event_type, event_date, start_time, end_time, guest_count, total_amount, status, notes) VALUES
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
(15, 15, 6,  'Willuda New Year Gala',           'Gala Dinner',      '2026-12-31', '19:00:00', '23:59:00', 300, 500000.00, 'Confirmed', 'Premium New Year event package.')
ON CONFLICT (id) DO NOTHING;
SELECT setval('events_id_seq', COALESCE((SELECT MAX(id) FROM events), 1));

-- Seed Payments
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
