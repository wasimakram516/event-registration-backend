const express = require("express");
const router = express.Router();
const { createRegistration, getRegistrations, getRegistrationsByEvent, deleteRegistration, getTotalRegistrations } = require("../controllers/registrationController");
const protectRoute = require("../middlewares/authMiddleware");

// Create a new registration
router.post("/", createRegistration);

// Get all registrations (protected)
router.get("/", protectRoute, getRegistrations);

// Get registrations for a specific event
router.get("/event/:eventId", protectRoute, getRegistrationsByEvent);

// Get total number of registrations
router.get("/count", protectRoute, getTotalRegistrations);

// Delete a registration by ID (protected)
router.delete("/:id", protectRoute, deleteRegistration);

module.exports = router;
