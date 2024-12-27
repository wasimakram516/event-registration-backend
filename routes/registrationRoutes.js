const express = require("express");
const router = express.Router();
const { createRegistration, getRegistrations, deleteRegistration } = require("../controllers/registrationController");
const protectRoute = require("../middlewares/authMiddleware");

// Create a new registration
router.post("/", createRegistration);

// Get all registrations (protected)
router.get("/", protectRoute, getRegistrations);

// Delete a registration by ID (protected)
router.delete("/:id", protectRoute, deleteRegistration);

module.exports = router;
