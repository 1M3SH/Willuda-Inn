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

    const isSupabase =
        Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.includes("supabase")) ||
        Boolean(process.env.PG_HOST && process.env.PG_HOST.includes("supabase"));

    const useSsl =
        process.env.PG_SSL === "true" ||
        isSupabase ||
        Boolean(process.env.DATABASE_URL && !process.env.DATABASE_URL.includes("localhost"));

    const poolConfig = process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: useSsl ? { rejectUnauthorized: false } : false
          }
        : {
            host: process.env.PG_HOST || process.env.DB_HOST || "localhost",
            user: process.env.PG_USER || process.env.DB_USER || "postgres",
            password: process.env.PG_PASSWORD || process.env.DB_PASSWORD || "postgres",
            database: process.env.PG_DATABASE || process.env.DB_NAME || "willuda_inn",
            port: Number(process.env.PG_PORT || process.env.DB_PORT || 5432),
            ssl: useSsl ? { rejectUnauthorized: false } : false
          };

    const pool = new Pool(poolConfig);

    pool.connect((err, client, release) => {
        if (err) {
            console.error("PostgreSQL connection failed:", err.message);
            return;
        }
        release();
        console.log("PostgreSQL connected successfully.");
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