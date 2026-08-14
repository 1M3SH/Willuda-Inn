"use strict";

const db = require("../config/db");

/* =====================================================
   GET ALL PAYMENTS
===================================================== */

function getAllPayments(callback) {
    const sql = `
        SELECT
            p.id,
            p.booking_id,
            p.customer_id,
            p.amount,
            p.payment_method,
            p.payment_status,
            p.transaction_reference,
            p.payment_date,
            p.notes,
            p.created_at,

            c.full_name AS customer_name,
            c.email AS customer_email,
            c.phone AS customer_phone,

            b.customer_name AS booking_customer_name,
            b.email AS booking_email,
            b.room_type,
            b.check_in,
            b.check_out,
            b.total_price AS booking_total,
            b.status AS booking_status

        FROM payments p

        LEFT JOIN customers c
            ON p.customer_id = c.id

        LEFT JOIN bookings b
            ON p.booking_id = b.id

        ORDER BY
            COALESCE(p.payment_date, p.created_at) DESC,
            p.id DESC
    `;

    db.query(sql, callback);
}

/* =====================================================
   GET PAYMENT BY ID
===================================================== */

function getPaymentById(paymentId, callback) {
    const sql = `
        SELECT
            p.id,
            p.booking_id,
            p.customer_id,
            p.amount,
            p.payment_method,
            p.payment_status,
            p.transaction_reference,
            p.payment_date,
            p.notes,
            p.created_at,

            c.full_name AS customer_name,
            c.email AS customer_email,
            c.phone AS customer_phone,

            b.customer_name AS booking_customer_name,
            b.email AS booking_email,
            b.room_type,
            b.check_in,
            b.check_out,
            b.total_price AS booking_total,
            b.status AS booking_status

        FROM payments p

        LEFT JOIN customers c
            ON p.customer_id = c.id

        LEFT JOIN bookings b
            ON p.booking_id = b.id

        WHERE p.id = ?
        LIMIT 1
    `;

    db.query(
        sql,
        [paymentId],
        callback
    );
}

/* =====================================================
   CREATE PAYMENT
===================================================== */

function createPayment(paymentData, callback) {
    const sql = `
        INSERT INTO payments (
            booking_id,
            customer_id,
            amount,
            payment_method,
            payment_status,
            transaction_reference,
            payment_date,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        paymentData.booking_id,
        paymentData.customer_id,
        paymentData.amount,
        paymentData.payment_method,
        paymentData.payment_status,
        paymentData.transaction_reference,
        paymentData.payment_date,
        paymentData.notes
    ];

    db.query(
        sql,
        values,
        callback
    );
}

/* =====================================================
   UPDATE PAYMENT
===================================================== */

function updatePayment(
    paymentId,
    paymentData,
    callback
) {
    const sql = `
        UPDATE payments

        SET
            booking_id = ?,
            customer_id = ?,
            amount = ?,
            payment_method = ?,
            payment_status = ?,
            transaction_reference = ?,
            payment_date = ?,
            notes = ?

        WHERE id = ?
    `;

    const values = [
        paymentData.booking_id,
        paymentData.customer_id,
        paymentData.amount,
        paymentData.payment_method,
        paymentData.payment_status,
        paymentData.transaction_reference,
        paymentData.payment_date,
        paymentData.notes,
        paymentId
    ];

    db.query(
        sql,
        values,
        callback
    );
}

/* =====================================================
   UPDATE PAYMENT STATUS
===================================================== */

function updatePaymentStatus(
    paymentId,
    paymentStatus,
    callback
) {
    const sql = `
        UPDATE payments
        SET payment_status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            paymentStatus,
            paymentId
        ],
        callback
    );
}

/* =====================================================
   DELETE PAYMENT
===================================================== */

function deletePayment(
    paymentId,
    callback
) {
    const sql = `
        DELETE FROM payments
        WHERE id = ?
    `;

    db.query(
        sql,
        [paymentId],
        callback
    );
}

module.exports = {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    updatePaymentStatus,
    deletePayment
};
