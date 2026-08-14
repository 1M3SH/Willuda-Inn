"use strict";

const express = require("express");

const {
    getFacilities,
    getFacility,
    createFacility,
    updateFacility,
    deleteFacility
} = require(
    "../controllers/facilityController"
);

const router =
    express.Router();

router.get(
    "/",
    getFacilities
);

router.get(
    "/:id",
    getFacility
);

router.post(
    "/",
    createFacility
);

router.put(
    "/:id",
    updateFacility
);

router.delete(
    "/:id",
    deleteFacility
);

module.exports = router;