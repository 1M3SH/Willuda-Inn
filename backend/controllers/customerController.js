"use strict";

const customerModel =
    require("../models/customerModel");

/* =========================================
   GET ALL CUSTOMERS
========================================= */

async function getCustomers(request, response) {
    try {
        const customers =
            await customerModel.getAllCustomers();

        response.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });

    } catch (error) {
        console.error(
            "Get customers error:",
            error
        );

        response.status(500).json({
            success: false,
            message:
                "Failed to retrieve customers."
        });
    }
}

/* =========================================
   GET CUSTOMER BY ID
========================================= */

async function getCustomer(request, response) {
    try {
        const customer =
            await customerModel.getCustomerById(
                request.params.id
            );

        if (!customer) {
            return response
                .status(404)
                .json({
                    success: false,
                    message:
                        "Customer not found."
                });
        }

        response.status(200).json({
            success: true,
            data: customer
        });

    } catch (error) {
        console.error(
            "Get customer error:",
            error
        );

        response.status(500).json({
            success: false,
            message:
                "Failed to retrieve customer."
        });
    }
}

/* =========================================
   CREATE CUSTOMER
========================================= */

async function createCustomer(request, response) {
    const {
        full_name,
        email,
        phone,
        address
    } = request.body;

    if (
        !full_name ||
        !email ||
        !phone
    ) {
        return response
            .status(400)
            .json({
                success: false,
                message:
                    "Full name, email and phone are required."
            });
    }

    try {
        const existingCustomer =
            await customerModel.getCustomerByEmail(
                email
            );

        if (existingCustomer) {
            return response
                .status(409)
                .json({
                    success: false,
                    message:
                        "A customer with this email already exists."
                });
        }

        const result =
            await customerModel.createCustomer({
                full_name:
                    String(full_name).trim(),

                email:
                    String(email)
                        .trim()
                        .toLowerCase(),

                phone:
                    String(phone).trim(),

                address:
                    String(address || "").trim(),

                status:
                    "Active"
            });

        response.status(201).json({
            success: true,
            message:
                "Customer created successfully.",
            data: {
                id: result.insertId,
                full_name,
                email,
                phone,
                address,
                status: "Active"
            }
        });

    } catch (error) {
        console.error(
            "Create customer error:",
            error
        );

        response.status(500).json({
            success: false,
            message:
                "Failed to create customer."
        });
    }
}

/* =========================================
   UPDATE CUSTOMER
========================================= */

async function updateCustomer(request, response) {
    const customerId =
        request.params.id;

    const {
        full_name,
        email,
        phone,
        address,
        status
    } = request.body;

    if (
        !full_name ||
        !email ||
        !phone ||
        !status
    ) {
        return response
            .status(400)
            .json({
                success: false,
                message:
                    "Full name, email, phone and status are required."
            });
    }

    try {
        const customer =
            await customerModel.getCustomerById(
                customerId
            );

        if (!customer) {
            return response
                .status(404)
                .json({
                    success: false,
                    message:
                        "Customer not found."
                });
        }

        const duplicateCustomer =
            await customerModel.getCustomerByEmail(
                email
            );

        if (
            duplicateCustomer &&
            String(duplicateCustomer.id) !==
                String(customerId)
        ) {
            return response
                .status(409)
                .json({
                    success: false,
                    message:
                        "Another customer already uses this email."
                });
        }

        await customerModel.updateCustomer(
            customerId,
            {
                full_name:
                    String(full_name).trim(),

                email:
                    String(email)
                        .trim()
                        .toLowerCase(),

                phone:
                    String(phone).trim(),

                address:
                    String(address || "").trim(),

                status:
                    String(status).trim()
            }
        );

        response.status(200).json({
            success: true,
            message:
                "Customer updated successfully."
        });

    } catch (error) {
        console.error(
            "Update customer error:",
            error
        );

        response.status(500).json({
            success: false,
            message:
                "Failed to update customer."
        });
    }
}

/* =========================================
   DELETE CUSTOMER
========================================= */

async function deleteCustomer(request, response) {
    try {
        const result =
            await customerModel.deleteCustomer(
                request.params.id
            );

        if (result.affectedRows === 0) {
            return response
                .status(404)
                .json({
                    success: false,
                    message:
                        "Customer not found."
                });
        }

        response.status(200).json({
            success: true,
            message:
                "Customer deleted successfully."
        });

    } catch (error) {
        console.error(
            "Delete customer error:",
            error
        );

        response.status(500).json({
            success: false,
            message:
                "Failed to delete customer."
        });
    }
}

module.exports = {
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer
};