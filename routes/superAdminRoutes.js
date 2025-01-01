const express = require("express");
const router = express.Router();
const {
  getAllAdmins,
  getAdminEvents,
  getEventRegistrations,
  updateAdminInfo,
  updateEventInfo,
  updateRegistrationInfo,
  deleteAdmin,
  deleteEvent,
  deleteRegistration,
} = require("../controllers/superAdminController");
const protectRoute = require("../middlewares/authMiddleware");
const isSuperAdmin = require("../middlewares/superAdminMiddleware");
const upload = require("../middlewares/cloudinaryMiddleware");

// Get all admins
router.get("/admins", protectRoute, isSuperAdmin, getAllAdmins);

// Get all events for a specific admin
router.get("/admins/:adminId/events", protectRoute, isSuperAdmin, getAdminEvents);

// Get registrations for a specific event
router.get("/events/:eventId/registrations", protectRoute, isSuperAdmin, getEventRegistrations);

// Update admin information
router.put("/admins/:id", protectRoute, isSuperAdmin, updateAdminInfo);

// Update event information
router.put("/events/:id", protectRoute, isSuperAdmin, upload.single("logo"), updateEventInfo);

// Update registration information
router.put("/registrations/:id", protectRoute, isSuperAdmin, updateRegistrationInfo);

// Delete admin
router.delete("/admins/:id", protectRoute, isSuperAdmin, deleteAdmin);

// Delete event
router.delete("/events/:id", protectRoute, isSuperAdmin, deleteEvent);

// Delete registration
router.delete("/registrations/:id", protectRoute, isSuperAdmin, deleteRegistration);

module.exports = router;
