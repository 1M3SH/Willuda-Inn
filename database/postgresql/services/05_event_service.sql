-- =========================================================
-- POSTGRESQL SERVICE 5: EVENT SERVICE
-- Table: events
-- =========================================================

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

SELECT 'events' AS service_table, COUNT(*) AS count FROM events;
