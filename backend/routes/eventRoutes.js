"use strict";

const express =
    require("express");

const eventController =
    require("../controllers/eventController");

const router =
    express.Router();

/* GET ALL EVENTS */

router.get(
    "/",
    eventController.getAllEvents
);

/* GET ONE EVENT */

router.get(
    "/:id",
    eventController.getEventById
);

/* CREATE EVENT */

router.post(
    "/",
    eventController.createEvent
);

/* UPDATE EVENT */

router.put(
    "/:id",
    eventController.updateEvent
);

/* UPDATE EVENT STATUS */

router.patch(
    "/:id/status",
    eventController.updateEventStatus
);

/* DELETE EVENT */

router.delete(
    "/:id",
    eventController.deleteEvent
);

module.exports = router;