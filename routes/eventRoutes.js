const express = require("express");
const router = express.Router();
const {
  getEventDetails,
  updateEvent,
  createEvent,
  deleteEvent,
} = require("../controllers/eventController");
const protectRoute = require("../middlewares/authMiddleware");
const upload = require("../middlewares/cloudinaryMiddleware"); // Import upload middleware

router.get("/", protectRoute, getEventDetails);
router.post("/", protectRoute, upload.single("logo"), createEvent); // Handle file upload
router.put("/:id", protectRoute, upload.single("logo"), updateEvent); // Allow file update
router.delete("/:id", protectRoute, deleteEvent);

module.exports = router;
