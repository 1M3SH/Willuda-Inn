"use strict";

const db = require("../config/db");

/* =========================================
   FIND ADMIN BY EMAIL
========================================= */

function findAdminByEmail(email, callback) {
    const sql = `
        SELECT
            id,
            full_name,
            email,
            password,
            role,
            status,
            created_at
        FROM admins
        WHERE email = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [email],
        callback
    );
}

/* =========================================
   UPDATE ADMIN PASSWORD
========================================= */

function updateAdminPassword(
    adminId,
    hashedPassword,
    callback
) {
    const sql = `
        UPDATE admins
        SET password = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            hashedPassword,
            adminId
        ],
        callback
    );
}

/* =========================================
   CREATE USER / ADMIN
========================================= */

function createUser(userData, callback) {
    const sql = `
        INSERT INTO admins (
            full_name,
            email,
            password,
            role,
            status
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            userData.full_name,
            userData.email,
            userData.password,
            userData.role || "Customer",
            userData.status || "Active"
        ],
        callback
    );
}

/* =========================================
   EXPORT MODEL FUNCTIONS
========================================= */

module.exports = {
    findAdminByEmail,
    updateAdminPassword,
    createUser
};