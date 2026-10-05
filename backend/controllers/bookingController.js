"use strict";

const bookingModel =
    require("../models/bookingModel");

/* =========================================
   GET ALL BOOKINGS
========================================= */

function getBookings(request, response) {
    const userEmail = request.query.email ? request.query.email.trim().toLowerCase() : null;

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

            let filtered = results;
            if (userEmail) {
                filtered = results.filter(
                    (b) => b.email && b.email.trim().toLowerCase() === userEmail
                );
            }

            response.status(200).json({
                success: true,
                count: filtered.length,
                data: filtered
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

    // If all fields provided, proceed directly
    if (
        customer_name &&
        email &&
        phone &&
        room_type &&
        check_in &&
        check_out &&
        guests &&
        total_price !== undefined &&
        status
    ) {
        const bookingData = {
            customer_name,
            email,
            phone,
            room_type,
            check_in,
            check_out,
            guests: Number(guests),
            total_price: Number(total_price),
            status
        };

        return bookingModel.updateBooking(
            bookingId,
            bookingData,
            (error, result) => {
                if (error) {
                    console.error("Update booking error:", error);
                    return response.status(500).json({
                        success: false,
                        message: "Failed to update booking."
                    });
                }

                if (result.affectedRows === 0) {
                    return response.status(404).json({
                        success: false,
                        message: "Booking not found."
                    });
                }

                return response.status(200).json({
                    success: true,
                    message: "Booking updated successfully."
                });
            }
        );
    }

    // Partial update: fetch existing booking first to merge
    bookingModel.getBookingById(bookingId, (err, results) => {
        if (err) {
            console.error("Get booking for update error:", err);
            return response.status(500).json({
                success: false,
                message: "Failed to update booking."
            });
        }

        if (!results || results.length === 0) {
            return response.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        const current = results[0];
        const bookingData = {
            customer_name: customer_name || current.customer_name,
            email: email || current.email,
            phone: phone || current.phone,
            room_type: room_type || current.room_type,
            check_in: check_in || current.check_in,
            check_out: check_out || current.check_out,
            guests: guests !== undefined ? Number(guests) : current.guests,
            total_price: total_price !== undefined ? Number(total_price) : current.total_price,
            status: status || current.status
        };

        bookingModel.updateBooking(bookingId, bookingData, (error, result) => {
            if (error) {
                console.error("Update booking error:", error);
                return response.status(500).json({
                    success: false,
                    message: "Failed to update booking."
                });
            }

            if (result.affectedRows === 0) {
                return response.status(404).json({
                    success: false,
                    message: "Booking not found."
                });
            }

            return response.status(200).json({
                success: true,
                message: "Booking updated successfully."
            });
        });
    });
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