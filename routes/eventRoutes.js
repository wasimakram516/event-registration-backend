const express = require("express");
const router = express.Router();
const {
  getEventDetails,
  getSingleEvent, // New function
  updateEvent,
  createEvent,
  deleteEvent,
} = require("../controllers/eventController");
const protectRoute = require("../middlewares/authMiddleware");
const upload = require("../middlewares/cloudinaryMiddleware");

// Get all events for the logged-in admin
router.get("/", protectRoute, getEventDetails);

// Get a single event by ID
router.get("/:id", protectRoute, getSingleEvent);

// Create a new event
router.post("/", protectRoute, upload.single("logo"), createEvent);

// Update an existing event
router.put("/:id", protectRoute, upload.single("logo"), updateEvent);

// Delete an event
router.delete("/:id", protectRoute, deleteEvent);

module.exports = router;
