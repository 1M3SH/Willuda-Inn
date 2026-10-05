"use strict";

/* =====================================================
   WILLUDA INN BACKEND SERVER
===================================================== */

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const express = require("express");
const cors = require("cors");

/* =====================================================
   DATABASE CONNECTION
===================================================== */

require("./config/db");

/* =====================================================
   ROUTES
===================================================== */

const authRoutes =
    require("./routes/authRoutes");

const bookingRoutes =
    require("./routes/bookingRoutes");

const customerRoutes =
    require("./routes/customerRoutes");

const facilityRoutes =
    require("./routes/facilityRoutes");

const eventRoutes =
    require("./routes/eventRoutes");

const paymentRoutes =
    require("./routes/paymentRoutes");

/* =====================================================
   EXPRESS APPLICATION
===================================================== */

const app = express();

const PORT =
    process.env.PORT || 5000;

/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

/* =====================================================
   HOME ROUTE
===================================================== */

app.get(
    "/",
    function (req, res) {
        res.status(200).json({
            success: true,

            message:
                "Willuda Inn API is running.",

            availableRoutes: {
                authentication:
                    "/api/auth",

                bookings:
                    "/api/bookings",

                customers:
                    "/api/customers",

                facilities:
                    "/api/facilities",

                events:
                    "/api/events",

                payments:
                    "/api/payments"
            }
        });
    }
);

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get(
    "/api/health",
    function (req, res) {
        res.status(200).json({
            success: true,

            message:
                "Willuda Inn backend is healthy.",

            timestamp:
                new Date().toISOString()
        });
    }
);

/* =====================================================
   API ROUTES
===================================================== */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/bookings",
    bookingRoutes
);

app.use(
    "/api/customers",
    customerRoutes
);

app.use(
    "/api/facilities",
    facilityRoutes
);

app.use(
    "/api/products",
    facilityRoutes
);

app.use(
    "/api/events",
    eventRoutes
);

app.use(
    "/api/payments",
    paymentRoutes
);

app.use(
    "/api/orders",
    bookingRoutes
);

app.use(
    "/api/users",
    customerRoutes
);

/* =====================================================
   ROUTE NOT FOUND
===================================================== */

app.use(
    function (req, res) {
        res.status(404).json({
            success: false,

            message:
                `Route not found: ${req.method} ${req.originalUrl}`
        });
    }
);

/* =====================================================
   GLOBAL ERROR HANDLER
===================================================== */

app.use(
    function (
        error,
        req,
        res,
        next
    ) {
        console.error(
            "Server error:",
            error
        );

        res.status(
            error.status || 500
        ).json({
            success: false,

            message:
                error.message ||
                "Internal server error."
        });
    }
);

/* =====================================================
   START SERVER
===================================================== */

if (require.main === module) {
    app.listen(
        PORT,
        function () {
        console.log(
            "======================================"
        );

        console.log(
            `Willuda Inn API running on http://localhost:${PORT}`
        );

        console.log(
            `Health check: http://localhost:${PORT}/api/health`
        );

        console.log(
            `Events API: http://localhost:${PORT}/api/events`
        );

        console.log(
            `Payments API: http://localhost:${PORT}/api/payments`
        );

        console.log(
            "======================================"
        );
        }
    );
}

module.exports = app;
