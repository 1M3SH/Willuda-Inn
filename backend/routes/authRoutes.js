"use strict";

const express =
    require("express");

const authController =
    require("../controllers/authController");

const router =
    express.Router();

/* =========================================
   ADMIN LOGIN
========================================= */

router.post(
    "/login",
    authController.loginAdmin
);

router.post(
    "/register",
    authController.register
);

module.exports = router;