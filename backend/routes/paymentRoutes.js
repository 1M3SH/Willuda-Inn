"use strict";

const express =
    require("express");

const paymentController =
    require("../controllers/paymentController");

const router =
    express.Router();

router.get(
    "/",
    paymentController.getAllPayments
);

router.get(
    "/:id",
    paymentController.getPaymentById
);

router.post(
    "/",
    paymentController.createPayment
);

router.put(
    "/:id",
    paymentController.updatePayment
);

router.patch(
    "/:id/status",
    paymentController.updatePaymentStatus
);

router.delete(
    "/:id",
    paymentController.deletePayment
);

module.exports = router;
