-- =========================================================
-- POSTGRESQL SERVICE 1: AUTHENTICATION SERVICE
-- Table: admins
-- =========================================================

CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Administrator',
    status VARCHAR(20) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

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

SELECT 'admins' AS service_table, COUNT(*) AS count FROM admins;
