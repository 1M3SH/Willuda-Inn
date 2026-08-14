"use strict";

const db =
    require("../config/db");

/* =========================================
   GET ALL CUSTOMERS
========================================= */

function getAllCustomers() {
    return new Promise(
        (resolve, reject) => {
            const sql = `
                SELECT *
                FROM customers
                ORDER BY id DESC
            `;

            db.query(
                sql,
                (error, results) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(results);
                }
            );
        }
    );
}

/* =========================================
   GET CUSTOMER BY ID
========================================= */

function getCustomerById(id) {
    return new Promise(
        (resolve, reject) => {
            const sql = `
                SELECT *
                FROM customers
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

                    resolve(
                        results[0] || null
                    );
                }
            );
        }
    );
}

/* =========================================
   GET CUSTOMER BY EMAIL
========================================= */

function getCustomerByEmail(email) {
    return new Promise(
        (resolve, reject) => {
            const sql = `
                SELECT *
                FROM customers
                WHERE email = ?
                LIMIT 1
            `;

            db.query(
                sql,
                [email],
                (error, results) => {
                    if (error) {
                        reject(error);
                        return;
                    }

                    resolve(
                        results[0] || null
                    );
                }
            );
        }
    );
}

/* =========================================
   CREATE CUSTOMER
========================================= */

function createCustomer(customer) {
    return new Promise(
        (resolve, reject) => {
            const sql = `
                INSERT INTO customers
                (
                    full_name,
                    email,
                    phone,
                    address,
                    status
                )
                VALUES (?, ?, ?, ?, ?)
            `;

            const values = [
                customer.full_name,
                customer.email,
                customer.phone,
                customer.address,
                customer.status
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
        }
    );
}

/* =========================================
   UPDATE CUSTOMER
========================================= */

function updateCustomer(
    id,
    customer
) {
    return new Promise(
        (resolve, reject) => {
            const sql = `
                UPDATE customers
                SET
                    full_name = ?,
                    email = ?,
                    phone = ?,
                    address = ?,
                    status = ?
                WHERE id = ?
            `;

            const values = [
                customer.full_name,
                customer.email,
                customer.phone,
                customer.address,
                customer.status,
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
        }
    );
}

/* =========================================
   DELETE CUSTOMER
========================================= */

function deleteCustomer(id) {
    return new Promise(
        (resolve, reject) => {
            const sql = `
                DELETE FROM customers
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
        }
    );
}

module.exports = {
    getAllCustomers,
    getCustomerById,
    getCustomerByEmail,
    createCustomer,
    updateCustomer,
    deleteCustomer
};