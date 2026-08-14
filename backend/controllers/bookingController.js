"use strict";

const bookingModel =
    require("../models/bookingModel");

/* =========================================
   GET ALL BOOKINGS
========================================= */

function getBookings(request, response) {
    bookingModel.getAllBookings(
        (error, results) => {
            if (error) {
                console.error(
                    "Get bookings error:",
                    error
                );

                return response
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Failed to retrieve bookings."
                    });
            }

            response.status(200).json({
                success: true,
                count: results.length,
                data: results
            });
        }
    );
}

/* =========================================
   GET BOOKING BY ID
========================================= */

function getBooking(request, response) {
    const bookingId =
        request.params.id;

    bookingModel.getBookingById(
        bookingId,
        (error, results) => {
            if (error) {
                console.error(
                    "Get booking error:",
                    error
                );

                return response
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Failed to retrieve booking."
                    });
            }

            if (results.length === 0) {
                return response
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Booking not found."
                    });
            }

            response.status(200).json({
                success: true,
                data: results[0]
            });
        }
    );
}

/* =========================================
   CREATE BOOKING
========================================= */

function createBooking(request, response) {
    const {
        customer_name,
        email,
        phone,
        room_type,
        check_in,
        check_out,
        guests,
        total_price,
        status
    } = request.body;

    if (
        !customer_name ||
        !email ||
        !phone ||
        !room_type ||
        !check_in ||
        !check_out ||
        !guests ||
        total_price === undefined
    ) {
        return response
            .status(400)
            .json({
                success: false,
                message:
                    "Please provide all required booking fields."
            });
    }

    if (
        Number(guests) < 1
    ) {
        return response
            .status(400)
            .json({
                success: false,
                message:
                    "Guest count must be at least 1."
            });
    }

    if (
        new Date(check_out) <=
        new Date(check_in)
    ) {
        return response
            .status(400)
            .json({
                success: false,
                message:
                    "Check-out date must be after check-in date."
            });
    }

    const bookingData = {
        customer_name,
        email,
        phone,
        room_type,
        check_in,
        check_out,
        guests:
            Number(guests),
        total_price:
            Number(total_price),
        status:
            status || "Pending"
    };

    bookingModel.createBooking(
        bookingData,
        (error, result) => {
            if (error) {
                console.error(
                    "Create booking error:",
                    error
                );

                return response
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Failed to create booking."
                    });
            }

            response
                .status(201)
                .json({
                    success: true,
                    message:
                        "Booking created successfully.",
                    data: {
                        id: result.insertId,
                        ...bookingData
                    }
                });
        }
    );
}

/* =========================================
   UPDATE BOOKING
========================================= */

function updateBooking(request, response) {
    const bookingId =
        request.params.id;

    const {
        customer_name,
        email,
        phone,
        room_type,
        check_in,
        check_out,
        guests,
        total_price,
        status
    } = request.body;

    if (
        !customer_name ||
        !email ||
        !phone ||
        !room_type ||
        !check_in ||
        !check_out ||
        !guests ||
        total_price === undefined ||
        !status
    ) {
        return response
            .status(400)
            .json({
                success: false,
                message:
                    "Please provide all booking fields."
            });
    }

    const bookingData = {
        customer_name,
        email,
        phone,
        room_type,
        check_in,
        check_out,
        guests:
            Number(guests),
        total_price:
            Number(total_price),
        status
    };

    bookingModel.updateBooking(
        bookingId,
        bookingData,
        (error, result) => {
            if (error) {
                console.error(
                    "Update booking error:",
                    error
                );

                return response
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Failed to update booking."
                    });
            }

            if (
                result.affectedRows === 0
            ) {
                return response
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Booking not found."
                    });
            }

            response.status(200).json({
                success: true,
                message:
                    "Booking updated successfully."
            });
        }
    );
}

/* =========================================
   DELETE BOOKING
========================================= */

function deleteBooking(request, response) {
    const bookingId =
        request.params.id;

    bookingModel.deleteBooking(
        bookingId,
        (error, result) => {
            if (error) {
                console.error(
                    "Delete booking error:",
                    error
                );

                return response
                    .status(500)
                    .json({
                        success: false,
                        message:
                            "Failed to delete booking."
                    });
            }

            if (
                result.affectedRows === 0
            ) {
                return response
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Booking not found."
                    });
            }

            response.status(200).json({
                success: true,
                message:
                    "Booking deleted successfully."
            });
        }
    );
}

module.exports = {
    getBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking
};