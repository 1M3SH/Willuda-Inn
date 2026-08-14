"use strict";

const db = require("../config/db");

/* =========================================
   GET ALL BOOKINGS
========================================= */

function getAllBookings(callback) {
    const sql = `
        SELECT *
        FROM bookings
        ORDER BY id DESC
    `;

    db.query(sql, callback);
}

/* =========================================
   GET BOOKING BY ID
========================================= */

function getBookingById(id, callback) {
    const sql = `
        SELECT *
        FROM bookings
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        callback
    );
}

/* =========================================
   CREATE BOOKING
========================================= */

function createBooking(data, callback) {
    const sql = `
        INSERT INTO bookings
        (
            customer_name,
            email,
            phone,
            room_type,
            check_in,
            check_out,
            guests,
            total_price,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.customer_name,
        data.email,
        data.phone,
        data.room_type,
        data.check_in,
        data.check_out,
        data.guests,
        data.total_price,
        data.status || "Pending"
    ];

    db.query(
        sql,
        values,
        callback
    );
}

/* =========================================
   UPDATE BOOKING
========================================= */

function updateBooking(id, data, callback) {
    const sql = `
        UPDATE bookings
        SET
            customer_name = ?,
            email = ?,
            phone = ?,
            room_type = ?,
            check_in = ?,
            check_out = ?,
            guests = ?,
            total_price = ?,
            status = ?
        WHERE id = ?
    `;

    const values = [
        data.customer_name,
        data.email,
        data.phone,
        data.room_type,
        data.check_in,
        data.check_out,
        data.guests,
        data.total_price,
        data.status,
        id
    ];

    db.query(
        sql,
        values,
        callback
    );
}

/* =========================================
   DELETE BOOKING
========================================= */

function deleteBooking(id, callback) {
    const sql = `
        DELETE FROM bookings
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        callback
    );
}

module.exports = {
    getAllBookings,
    getBookingById,
    createBooking,
    updateBooking,
    deleteBooking
};