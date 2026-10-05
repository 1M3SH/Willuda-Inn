-- =========================================================
-- WILLUDA INN - ALL SERVICES DATABASE INITIALIZER
-- Sequentially runs all independent service database files
-- =========================================================

SOURCE 01_auth_service.sql;
SOURCE 02_customer_service.sql;
SOURCE 03_facility_service.sql;
SOURCE 04_booking_service.sql;
SOURCE 05_event_service.sql;
SOURCE 06_payment_service.sql;

-- Final Verification Summary
SELECT 'admins' AS service_table, COUNT(*) AS count FROM admins
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
