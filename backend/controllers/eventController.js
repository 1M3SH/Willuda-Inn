"use strict";

const eventModel =
    require("../models/eventModel");

/* =========================================
   HELPER FUNCTIONS
========================================= */

function cleanText(value) {
    return String(value ?? "").trim();
}

function createEventPayload(body) {
    return {
        customer_id:
            body.customer_id
                ? Number(body.customer_id)
                : null,

        facility_id:
            body.facility_id
                ? Number(body.facility_id)
                : null,

        event_name:
            cleanText(body.event_name),

        event_type:
            cleanText(body.event_type),

        event_date:
            cleanText(body.event_date),

        start_time:
            cleanText(body.start_time) ||
            null,

        end_time:
            cleanText(body.end_time) ||
            null,

        guest_count:
            Number(body.guest_count) || 1,

        total_amount:
            Number(body.total_amount) || 0,

        status:
            cleanText(body.status) ||
            "Planned",

        notes:
            cleanText(body.notes) ||
            null
    };
}

function validateEventData(eventData) {
    if (!eventData.event_name) {
        return "Event name is required.";
    }

    if (!eventData.event_type) {
        return "Event type is required.";
    }

    if (!eventData.event_date) {
        return "Event date is required.";
    }

    if (eventData.guest_count < 1) {
        return "Guest count must be at least 1.";
    }

    if (eventData.total_amount < 0) {
        return "Total amount cannot be negative.";
    }

    return null;
}

/* =========================================
   GET ALL EVENTS
========================================= */

function getAllEvents(req, res) {
    eventModel.getAllEvents(
        function (
            databaseError,
            results
        ) {
            if (databaseError) {
                console.error(
                    "Get events error:",
                    databaseError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to load event records."
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

/* =========================================
   GET EVENT BY ID
========================================= */

function getEventById(req, res) {
    const eventId =
        Number(req.params.id);

    if (!Number.isInteger(eventId)) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid event ID."
        });
    }

    eventModel.getEventById(
        eventId,
        function (
            databaseError,
            results
        ) {
            if (databaseError) {
                console.error(
                    "Get event error:",
                    databaseError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to load the event."
                });
            }

            if (
                !Array.isArray(results) ||
                results.length === 0
            ) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Event record not found."
                });
            }

            return res.status(200).json({
                success: true,
                data: results[0]
            });
        }
    );
}

/* =========================================
   CREATE EVENT
========================================= */

function createEvent(req, res) {
    const eventData =
        createEventPayload(req.body);

    const validationError =
        validateEventData(eventData);

    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        });
    }

    eventModel.createEvent(
        eventData,
        function (
            databaseError,
            result
        ) {
            if (databaseError) {
                console.error(
                    "Create event error:",
                    databaseError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to create the event."
                });
            }

            eventModel.getEventById(
                result.insertId,
                function (
                    getError,
                    eventResults
                ) {
                    if (getError) {
                        return res.status(201).json({
                            success: true,
                            message:
                                "Event created successfully.",
                            eventId:
                                result.insertId
                        });
                    }

                    return res.status(201).json({
                        success: true,
                        message:
                            "Event created successfully.",
                        data:
                            eventResults[0]
                    });
                }
            );
        }
    );
}

/* =========================================
   UPDATE EVENT
========================================= */

function updateEvent(req, res) {
    const eventId =
        Number(req.params.id);

    if (!Number.isInteger(eventId)) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid event ID."
        });
    }

    const eventData =
        createEventPayload(req.body);

    const validationError =
        validateEventData(eventData);

    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        });
    }

    eventModel.updateEvent(
        eventId,
        eventData,
        function (
            databaseError,
            result
        ) {
            if (databaseError) {
                console.error(
                    "Update event error:",
                    databaseError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to update the event."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Event record not found."
                });
            }

            eventModel.getEventById(
                eventId,
                function (
                    getError,
                    eventResults
                ) {
                    if (getError) {
                        return res.status(200).json({
                            success: true,
                            message:
                                "Event updated successfully."
                        });
                    }

                    return res.status(200).json({
                        success: true,
                        message:
                            "Event updated successfully.",
                        data:
                            eventResults[0]
                    });
                }
            );
        }
    );
}

/* =========================================
   UPDATE STATUS
========================================= */

function updateEventStatus(req, res) {
    const eventId =
        Number(req.params.id);

    const status =
        cleanText(req.body.status);

    const allowedStatuses = [
        "Planned",
        "Confirmed",
        "Completed",
        "Cancelled"
    ];

    if (!Number.isInteger(eventId)) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid event ID."
        });
    }

    if (
        !allowedStatuses.includes(
            status
        )
    ) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid event status."
        });
    }

    eventModel.updateEventStatus(
        eventId,
        status,
        function (
            databaseError,
            result
        ) {
            if (databaseError) {
                console.error(
                    "Status update error:",
                    databaseError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to update event status."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Event record not found."
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Event status updated successfully."
            });
        }
    );
}

/* =========================================
   DELETE EVENT
========================================= */

function deleteEvent(req, res) {
    const eventId =
        Number(req.params.id);

    if (!Number.isInteger(eventId)) {
        return res.status(400).json({
            success: false,
            message:
                "Invalid event ID."
        });
    }

    eventModel.deleteEvent(
        eventId,
        function (
            databaseError,
            result
        ) {
            if (databaseError) {
                console.error(
                    "Delete event error:",
                    databaseError
                );

                return res.status(500).json({
                    success: false,
                    message:
                        "Unable to delete the event."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Event record not found."
                });
            }

            return res.status(200).json({
                success: true,
                message:
                    "Event deleted successfully."
            });
        }
    );
}

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    updateEventStatus,
    deleteEvent
};