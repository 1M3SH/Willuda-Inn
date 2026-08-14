"use strict";

const db = require("../config/db");

/* =========================================
   GET ALL EVENTS
========================================= */

function getAllEvents(callback) {
    const sql = `
        SELECT
            e.id,
            e.customer_id,
            e.facility_id,
            e.event_name,
            e.event_type,
            e.event_date,
            e.start_time,
            e.end_time,
            e.guest_count,
            e.total_amount,
            e.status,
            e.notes,
            e.created_at,

            c.full_name AS customer_name,
            c.email AS customer_email,
            c.phone AS customer_phone,

            f.facility_name,
            f.facility_type,
            f.location

        FROM events e

        LEFT JOIN customers c
            ON e.customer_id = c.id

        LEFT JOIN facilities f
            ON e.facility_id = f.id

        ORDER BY e.event_date ASC,
                 e.start_time ASC
    `;

    db.query(sql, callback);
}

/* =========================================
   GET EVENT BY ID
========================================= */

function getEventById(eventId, callback) {
    const sql = `
        SELECT
            e.id,
            e.customer_id,
            e.facility_id,
            e.event_name,
            e.event_type,
            e.event_date,
            e.start_time,
            e.end_time,
            e.guest_count,
            e.total_amount,
            e.status,
            e.notes,
            e.created_at,

            c.full_name AS customer_name,
            c.email AS customer_email,
            c.phone AS customer_phone,

            f.facility_name,
            f.facility_type,
            f.location

        FROM events e

        LEFT JOIN customers c
            ON e.customer_id = c.id

        LEFT JOIN facilities f
            ON e.facility_id = f.id

        WHERE e.id = ?

        LIMIT 1
    `;

    db.query(
        sql,
        [eventId],
        callback
    );
}

/* =========================================
   CREATE EVENT
========================================= */

function createEvent(eventData, callback) {
    const sql = `
        INSERT INTO events (
            customer_id,
            facility_id,
            event_name,
            event_type,
            event_date,
            start_time,
            end_time,
            guest_count,
            total_amount,
            status,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        eventData.customer_id,
        eventData.facility_id,
        eventData.event_name,
        eventData.event_type,
        eventData.event_date,
        eventData.start_time,
        eventData.end_time,
        eventData.guest_count,
        eventData.total_amount,
        eventData.status,
        eventData.notes
    ];

    db.query(
        sql,
        values,
        callback
    );
}

/* =========================================
   UPDATE EVENT
========================================= */

function updateEvent(
    eventId,
    eventData,
    callback
) {
    const sql = `
        UPDATE events

        SET
            customer_id = ?,
            facility_id = ?,
            event_name = ?,
            event_type = ?,
            event_date = ?,
            start_time = ?,
            end_time = ?,
            guest_count = ?,
            total_amount = ?,
            status = ?,
            notes = ?

        WHERE id = ?
    `;

    const values = [
        eventData.customer_id,
        eventData.facility_id,
        eventData.event_name,
        eventData.event_type,
        eventData.event_date,
        eventData.start_time,
        eventData.end_time,
        eventData.guest_count,
        eventData.total_amount,
        eventData.status,
        eventData.notes,
        eventId
    ];

    db.query(
        sql,
        values,
        callback
    );
}

/* =========================================
   UPDATE EVENT STATUS
========================================= */

function updateEventStatus(
    eventId,
    status,
    callback
) {
    const sql = `
        UPDATE events
        SET status = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            status,
            eventId
        ],
        callback
    );
}

/* =========================================
   DELETE EVENT
========================================= */

function deleteEvent(
    eventId,
    callback
) {
    const sql = `
        DELETE FROM events
        WHERE id = ?
    `;

    db.query(
        sql,
        [eventId],
        callback
    );
}

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    updateEventStatus,
    deleteEvent
};