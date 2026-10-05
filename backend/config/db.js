"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const dbClient = (process.env.DB_CLIENT || "postgres").toLowerCase();

let db;

if (dbClient === "mysql") {
    const mysql = require("mysql2");
    const connection = mysql.createConnection({
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "willuda_inn",
        port: Number(process.env.DB_PORT) || 3306
    });

    connection.connect((err) => {
        if (err) {
            console.error("MySQL connection failed:", err.message);
            return;
        }
        console.log("MySQL connected.");
    });

    db = connection;
} else {
    // PostgreSQL Client (Default)
    const { Pool } = require("pg");

    const host =
        process.env.PGHOST ||
        process.env.PG_HOST ||
        process.env.DB_HOST ||
        "localhost";

    const user =
        process.env.PGUSER ||
        process.env.PG_USER ||
        process.env.DB_USER ||
        "postgres";

    const password =
        process.env.PGPASSWORD ||
        process.env.PG_PASSWORD ||
        process.env.DB_PASSWORD ||
        "postgres";

    const database =
        process.env.PGDATABASE ||
        process.env.PG_DATABASE ||
        process.env.DB_NAME ||
        "willuda_inn";

    const port = Number(
        process.env.PGPORT ||
        process.env.PG_PORT ||
        process.env.DB_PORT ||
        5432
    );

    const isSupabase =
        Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes("supabase")) ||
        Boolean(host && host.includes("supabase"));

    const isRailway =
        Boolean(process.env.RAILWAY_ENVIRONMENT) ||
        Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes("railway.internal")) ||
        Boolean(host && host.includes("railway"));

    const useSsl =
        process.env.PG_SSL === "true" ||
        isSupabase ||
        (Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost")) && !isRailway);

    const poolConfig = process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: useSsl ? { rejectUnauthorized: false } : false
          }
        : {
            host,
            user,
            password,
            database,
            port,
            ssl: useSsl ? { rejectUnauthorized: false } : false
          };

    const pool = new Pool(poolConfig);

    async function initializePostgresTables(client) {
        try {
            await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    full_name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'Customer',
                    status VARCHAR(50) DEFAULT 'Active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS customers (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    phone VARCHAR(50),
                    address TEXT,
                    status VARCHAR(50) DEFAULT 'Active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS facilities (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    type VARCHAR(50),
                    capacity INT DEFAULT 1,
                    price_per_night NUMERIC(10,2) DEFAULT 0.00,
                    status VARCHAR(50) DEFAULT 'Available',
                    description TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS bookings (
                    id SERIAL PRIMARY KEY,
                    customer_name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    phone VARCHAR(50) NOT NULL,
                    room_type VARCHAR(100) NOT NULL,
                    check_in DATE NOT NULL,
                    check_out DATE NOT NULL,
                    guests INT DEFAULT 1,
                    total_price NUMERIC(10,2) NOT NULL,
                    status VARCHAR(50) DEFAULT 'Pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS events (
                    id SERIAL PRIMARY KEY,
                    customer_name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    phone VARCHAR(50) NOT NULL,
                    event_type VARCHAR(100) NOT NULL,
                    event_date DATE NOT NULL,
                    guests INT DEFAULT 1,
                    total_price NUMERIC(10,2) NOT NULL,
                    status VARCHAR(50) DEFAULT 'Pending',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                CREATE TABLE IF NOT EXISTS payments (
                    id SERIAL PRIMARY KEY,
                    booking_id INT,
                    customer_name VARCHAR(100) NOT NULL,
                    amount NUMERIC(10,2) NOT NULL,
                    payment_method VARCHAR(50) DEFAULT 'Card',
                    payment_status VARCHAR(50) DEFAULT 'Pending',
                    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );

                INSERT INTO users (full_name, email, password, role, status)
                VALUES 
                ('Prabhath Akalanka', 'admin@willudainn.com', '$2b$10$1t.oymF4zEPvodZfb01UG.Rjg3Ie7HouqD4zspslXrS4zqytfmdYq', 'Administrator', 'Active'),
                ('Tharuka Prabathiya', 'tharukaprabathiya833@gmail.com', '$2b$10$/8AqZ8O.QNbWI/rrxpIiDeoNjkOcYVt3hmiObuDZFyKDjMjq3LIEm', 'Customer', 'Active')
                ON CONFLICT (email) DO NOTHING;

                INSERT INTO facilities (name, type, capacity, price_per_night, status, description)
                VALUES
                ('Luxury Deluxe Room', 'Room', 2, 85.00, 'Available', 'Spacious luxury room with garden view and modern amenities.'),
                ('Standard Room', 'Room', 2, 65.00, 'Available', 'Comfortable standard room equipped with king bed and high-speed Wi-Fi.'),
                ('Family Suite', 'Room', 4, 120.00, 'Available', 'Premium two-bedroom suite ideal for family vacations.'),
                ('Wedding Hall', 'Hall', 300, 500.00, 'Available', 'Grand ballroom designed for elegant wedding celebrations.'),
                ('Conference Hall', 'Hall', 100, 350.00, 'Available', 'Professional corporate hall with full audio-visual integration.'),
                ('Garden Area', 'Outdoor', 150, 250.00, 'Available', 'Scenic landscaped outdoor lawns for receptions and parties.')
                ON CONFLICT DO NOTHING;
            `);
            console.log("PostgreSQL database tables and default seeds verified.");
        } catch (initErr) {
            console.warn("Table auto-migration notice:", initErr.message);
        }
    }

    pool.connect(async (err, client, release) => {
        if (err) {
            console.error("PostgreSQL connection failed:", err.message);
            return;
        }
        console.log("PostgreSQL connected successfully.");
        await initializePostgresTables(client);
        release();
    });

    // Compatibility wrapper for models that use db.query(sql, [params], callback)
    db = {
        query(sql, values, callback) {
            if (typeof values === "function") {
                callback = values;
                values = [];
            }

            // Convert MySQL '?' placeholders to PostgreSQL '$1, $2, ...'
            let paramIndex = 1;
            let pgSql = sql.replace(/'[^']*'|(\?)/g, (match, p1) => {
                if (p1) {
                    return `$${paramIndex++}`;
                }
                return match;
            });

            const isInsert = /^\s*INSERT\s+INTO/i.test(pgSql);
            if (isInsert && !/RETURNING/i.test(pgSql)) {
                pgSql += " RETURNING id";
            }

            pool.query(pgSql, values || [], (err, res) => {
                if (err) {
                    return callback ? callback(err) : null;
                }

                let results;
                if (/^\s*(INSERT|UPDATE|DELETE)\b/i.test(sql)) {
                    results = {
                        insertId: res.rows && res.rows[0] && res.rows[0].id ? res.rows[0].id : null,
                        affectedRows: res.rowCount,
                        rows: res.rows
                    };
                } else {
                    results = res.rows;
                }

                if (callback) {
                    callback(null, results);
                }
            });
        },
        end(cb) {
            return pool.end(cb);
        },
        pool
    };
}

module.exports = db;