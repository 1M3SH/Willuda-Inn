"use strict";

const express = require("express");

const {
    getBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking
} = require(
    "../controllers/bookingController"
);

const router =
    express.Router();

/* =========================================
   BOOKING ROUTES
========================================= */

router.get(
    "/",
    getBookings
);

router.get(
    "/:id",
    getBooking
);

router.post(
    "/",
    createBooking
);

router.put(
    "/:id",
    updateBooking
);

router.patch(
    "/:id",
    updateBooking
);

router.patch(
    "/:id/status",
    updateBooking
);

router.delete(
    "/:id",
    deleteBooking
);

module.exports = router;