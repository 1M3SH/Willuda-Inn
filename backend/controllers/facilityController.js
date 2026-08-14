"use strict";

const facilityModel =
    require("../models/facilityModel");

/* =========================================
   GET ALL FACILITIES
========================================= */

async function getFacilities(request, response) {
    try {
        const facilities =
            await facilityModel.getAllFacilities();

        response.status(200).json({
            success: true,
            count: facilities.length,
            data: facilities
        });

    } catch (error) {
        console.error(
            "Get facilities error:",
            error
        );

        response.status(500).json({
            success: false,
            message:
                "Failed to retrieve facilities."
        });
    }
}

/* =========================================
   GET FACILITY BY ID
========================================= */

async function getFacility(request, response) {
    try {
        const facility =
            await facilityModel.getFacilityById(
                request.params.id
            );

        if (!facility) {
            return response
                .status(404)
                .json({
                    success: false,
                    message:
                        "Facility not found."
                });
        }

        response.status(200).json({
            success: true,
            data: facility
        });

    } catch (error) {
        console.error(
            "Get facility error:",
            error
        );

        response.status(500).json({
            success: false,
            message:
                "Failed to retrieve facility."
        });
    }
}

/* =========================================
   CREATE FACILITY
========================================= */

async function createFacility(request, response) {
    const {
        facility_name,
        facility_type,
        location,
        capacity,
        description,
        price,
        status
    } = request.body;

    if (
        !facility_name ||
        !facility_type ||
        !location ||
        !capacity ||
        price === undefined
    ) {
        return response
            .status(400)
            .json({
                success: false,
                message:
                    "Name, type, location, capacity and price are required."
            });
    }

    if (Number(capacity) < 1) {
        return response
            .status(400)
            .json({
                success: false,
                message:
                    "Capacity must be at least 1."
            });
    }

    if (Number(price) < 0) {
        return response
            .status(400)
            .json({
                success: false,
                message:
                    "Price cannot be negative."
            });
    }

    const facilityData = {
        facility_name:
            String(facility_name).trim(),

        facility_type:
            String(facility_type).trim(),

        location:
            String(location).trim(),

        capacity:
            Number(capacity),

        description:
            String(description || "").trim(),

        price:
            Number(price),

        status:
            String(status || "Available").trim()
    };

    try {
        const result =
            await facilityModel.createFacility(
                facilityData
            );

        response.status(201).json({
            success: true,
            message:
                "Facility created successfully.",
            data: {
                id: result.insertId,
                ...facilityData
            }
        });

    } catch (error) {
        console.error(
            "Create facility error:",
            error
        );

        response.status(500).json({
            success: false,
            message:
                "Failed to create facility."
        });
    }
}

/* =========================================
   UPDATE FACILITY
========================================= */

async function updateFacility(request, response) {
    const facilityId =
        request.params.id;

    const {
        facility_name,
        facility_type,
        location,
        capacity,
        description,
        price,
        status
    } = request.body;

    if (
        !facility_name ||
        !facility_type ||
        !location ||
        !capacity ||
        price === undefined ||
        !status
    ) {
        return response
            .status(400)
            .json({
                success: false,
                message:
                    "Please provide all required facility fields."
            });
    }

    try {
        const existingFacility =
            await facilityModel.getFacilityById(
                facilityId
            );

        if (!existingFacility) {
            return response
                .status(404)
                .json({
                    success: false,
                    message:
                        "Facility not found."
                });
        }

        await facilityModel.updateFacility(
            facilityId,
            {
                facility_name:
                    String(facility_name).trim(),

                facility_type:
                    String(facility_type).trim(),

                location:
                    String(location).trim(),

                capacity:
                    Number(capacity),

                description:
                    String(description || "").trim(),

                price:
                    Number(price),

                status:
                    String(status).trim()
            }
        );

        response.status(200).json({
            success: true,
            message:
                "Facility updated successfully."
        });

    } catch (error) {
        console.error(
            "Update facility error:",
            error
        );

        response.status(500).json({
            success: false,
            message:
                "Failed to update facility."
        });
    }
}

/* =========================================
   DELETE FACILITY
========================================= */

async function deleteFacility(request, response) {
    try {
        const result =
            await facilityModel.deleteFacility(
                request.params.id
            );

        if (result.affectedRows === 0) {
            return response
                .status(404)
                .json({
                    success: false,
                    message:
                        "Facility not found."
                });
        }

        response.status(200).json({
            success: true,
            message:
                "Facility deleted successfully."
        });

    } catch (error) {
        console.error(
            "Delete facility error:",
            error
        );

        response.status(500).json({
            success: false,
            message:
                "Failed to delete facility."
        });
    }
}

module.exports = {
    getFacilities,
    getFacility,
    createFacility,
    updateFacility,
    deleteFacility
};