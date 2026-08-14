"use strict";

const paymentModel =
    require("../models/paymentModel");

/* =====================================================
   HELPERS
===================================================== */

function cleanText(value) {
    return String(value ?? "").trim();
}

function optionalInteger(value) {
    const parsedValue =
        Number(value);

    return Number.isInteger(parsedValue) &&
        parsedValue > 0
        ? parsedValue
        : null;
}

function createTransactionReference() {
    const timestamp =
        Date.now()
            .toString()
            .slice(-8);

    const randomNumber =
        Math.floor(
            Math.random() * 1000
        )
            .toString()
            .padStart(3, "0");

    return `WLI-PAY-${timestamp}${randomNumber}`;
}

function createPaymentPayload(body) {
    return {
        booking_id:
            optionalInteger(
                body.booking_id
            ),

        customer_id:
            optionalInteger(
                body.customer_id
            ),

        amount:
            Number(body.amount),

        payment_method:
            cleanText(
                body.payment_method
            ),

        payment_status:
            cleanText(
                body.payment_status
            ) || "Pending",

        transaction_reference:
            cleanText(
                body.transaction_reference
            ) ||
            createTransactionReference(),

        payment_date:
            cleanText(
                body.payment_date
            ) || null,

        notes:
            cleanText(
                body.notes
            ) || null
    };
}

function validatePaymentData(
    paymentData
) {
    const allowedStatuses = [
        "Pending",
        "Partial",
        "Paid",
        "Refunded",
        "Failed"
    ];

    const allowedMethods = [
        "Cash",
        "Credit Card",
        "Debit Card",
        "Bank Transfer",
        "Online Payment"
    ];

    if (
        !Number.isFinite(
            paymentData.amount
        ) ||
        paymentData.amount < 0
    ) {
        return "Enter a valid payment amount.";
    }

    if (
        !allowedMethods.includes(
            paymentData.payment_method
        )
    ) {
        return "Select a valid payment method.";
    }

    if (
        !allowedStatuses.includes(
            paymentData.payment_status
        )
    ) {
        return "Select a valid payment status.";
    }

    return null;
}

function isValidId(value) {
    return (
        Number.isInteger(value) &&
        value > 0
    );
}

/* =====================================================
   GET ALL PAYMENTS
===================================================== */

function getAllPayments(req, res) {
    paymentModel.getAllPayments(
        function (
            databaseError,
            results
        ) {
            if (databaseError) {
                console.error(
                    "Get payments error:",
                    databaseError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to load payment records."
                });
            }

            return res.status(200).json({
                success: true,
                count:
                    Array.isArray(results)
                        ? results.length
                        : 0,
                data:
                    Array.isArray(results)
                        ? results
                        : []
            });
        }
    );
}

/* =====================================================
   GET PAYMENT BY ID
===================================================== */

function getPaymentById(req, res) {
    const paymentId =
        Number(req.params.id);

    if (!isValidId(paymentId)) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid payment ID."
        });
    }

    paymentModel.getPaymentById(
        paymentId,
        function (
            databaseError,
            results
        ) {
            if (databaseError) {
                console.error(
                    "Get payment error:",
                    databaseError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to load the payment."
                });
            }

            if (
                !Array.isArray(results) ||
                results.length === 0
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Payment record not found."
                });
            }

            return res.status(200).json({
                success: true,
                data: results[0]
            });
        }
    );
}

/* =====================================================
   CREATE PAYMENT
===================================================== */

function createPayment(req, res) {
    const paymentData =
        createPaymentPayload(
            req.body
        );

    const validationError =
        validatePaymentData(
            paymentData
        );

    if (validationError) {
        return res.status(400).json({
            success: false,
            message:
                validationError
        });
    }

    paymentModel.createPayment(
        paymentData,
        function (
            databaseError,
            result
        ) {
            if (databaseError) {
                console.error(
                    "Create payment error:",
                    databaseError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to create the payment."
                });
            }

            paymentModel.getPaymentById(
                result.insertId,
                function (
                    getError,
                    paymentResults
                ) {
                    if (getError) {
                        return res.status(201).json({
                            success: true,
                            message:
                                "Payment created successfully.",
                            paymentId:
                                result.insertId
                        });
                    }

                    return res.status(201).json({
                        success: true,
                        message:
                            "Payment created successfully.",
                        data:
                            paymentResults[0]
                    });
                }
            );
        }
    );
}

/* =====================================================
   UPDATE PAYMENT
===================================================== */

function updatePayment(req, res) {
    const paymentId =
        Number(req.params.id);

    if (!isValidId(paymentId)) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid payment ID."
        });
    }

    const paymentData =
        createPaymentPayload(
            req.body
        );

    const validationError =
        validatePaymentData(
            paymentData
        );

    if (validationError) {
        return res.status(400).json({
            success: false,
            message:
                validationError
        });
    }

    paymentModel.updatePayment(
        paymentId,
        paymentData,
        function (
            databaseError,
            result
        ) {
            if (databaseError) {
                console.error(
                    "Update payment error:",
                    databaseError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to update the payment."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Payment record not found."
                });
            }

            paymentModel.getPaymentById(
                paymentId,
                function (
                    getError,
                    paymentResults
                ) {
                    if (getError) {
                        return res.status(200).json({
                            success: true,
                            message:
                                "Payment updated successfully."
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message:
                            "Payment updated successfully.",
                        data:
                            paymentResults[0]
                    });
                }
            );
        }
    );
}

/* =====================================================
   UPDATE PAYMENT STATUS
===================================================== */

function updatePaymentStatus(
    req,
    res
) {
    const paymentId =
        Number(req.params.id);

    const paymentStatus =
        cleanText(
            req.body.payment_status ||
            req.body.status
        );

    const allowedStatuses = [
        "Pending",
        "Partial",
        "Paid",
        "Refunded",
        "Failed"
    ];

    if (!isValidId(paymentId)) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid payment ID."
        });
    }

    if (
        !allowedStatuses.includes(
            paymentStatus
        )
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid payment status."
        });
    }

    paymentModel.updatePaymentStatus(
        paymentId,
        paymentStatus,
        function (
            databaseError,
            result
        ) {
            if (databaseError) {
                console.error(
                    "Payment status update error:",
                    databaseError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to update payment status."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Payment record not found."
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Payment status updated successfully."
            });
        }
    );
}

/* =====================================================
   DELETE PAYMENT
===================================================== */

function deletePayment(req, res) {
    const paymentId =
        Number(req.params.id);

    if (!isValidId(paymentId)) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid payment ID."
        });
    }

    paymentModel.deletePayment(
        paymentId,
        function (
            databaseError,
            result
        ) {
            if (databaseError) {
                console.error(
                    "Delete payment error:",
                    databaseError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to delete the payment."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Payment record not found."
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Payment deleted successfully."
            });
        }
    );
}

module.exports = {
    getAllPayments,
    getPaymentById,
    createPayment,
    updatePayment,
    updatePaymentStatus,
    deletePayment
};
