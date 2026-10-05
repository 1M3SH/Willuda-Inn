-- =========================================================
-- WILLUDA INN - POSTGRESQL ALL SERVICES INITIALIZER
-- Sequentially runs all PostgreSQL service schemas
-- =========================================================

\i 01_auth_service.sql
\i 02_customer_service.sql
\i 03_facility_service.sql
\i 04_booking_service.sql
\i 05_event_service.sql
\i 06_payment_service.sql

-- Summary check
SELECT 'admins' AS table_name, COUNT(*) AS count FROM admins
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'facilities', COUNT(*) FROM facilities
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'events', COUNT(*) FROM events
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;
