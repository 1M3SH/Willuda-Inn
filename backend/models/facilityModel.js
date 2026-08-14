"use strict";

const db = require("../config/db");

/* =========================================
   GET ALL FACILITIES
========================================= */

function getAllFacilities() {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM facilities
            ORDER BY id DESC
        `;

        db.query(sql, (error, results) => {
            if (error) {
                reject(error);
                return;
            }

            resolve(results);
        });
    });
}

/* =========================================
   GET FACILITY BY ID
========================================= */

function getFacilityById(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT *
            FROM facilities
            WHERE id = ?
            LIMIT 1
        `;

        db.query(
            sql,
            [id],
            (error, results) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(results[0] || null);
            }
        );
    });
}

/* =========================================
   CREATE FACILITY
========================================= */

function createFacility(facility) {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO facilities
            (
                facility_name,
                facility_type,
                location,
                capacity,
                description,
                price,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            facility.facility_name,
            facility.facility_type,
            facility.location,
            facility.capacity,
            facility.description,
            facility.price,
            facility.status
        ];

        db.query(
            sql,
            values,
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );
    });
}

/* =========================================
   UPDATE FACILITY
========================================= */

function updateFacility(id, facility) {
    return new Promise((resolve, reject) => {
        const sql = `
            UPDATE facilities
            SET
                facility_name = ?,
                facility_type = ?,
                location = ?,
                capacity = ?,
                description = ?,
                price = ?,
                status = ?
            WHERE id = ?
        `;

        const values = [
            facility.facility_name,
            facility.facility_type,
            facility.location,
            facility.capacity,
            facility.description,
            facility.price,
            facility.status,
            id
        ];

        db.query(
            sql,
            values,
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );
    });
}

/* =========================================
   DELETE FACILITY
========================================= */

function deleteFacility(id) {
    return new Promise((resolve, reject) => {
        const sql = `
            DELETE FROM facilities
            WHERE id = ?
        `;

        db.query(
            sql,
            [id],
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );
    });
}

module.exports = {
    getAllFacilities,
    getFacilityById,
    createFacility,
    updateFacility,
    deleteFacility
};