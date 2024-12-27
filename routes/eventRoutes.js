const express = require("express");
const router = express.Router();
const {
  getEventDetails,
  updateEvent,
  createEvent,
  deleteEvent,
} = require("../controllers/eventController");
const protectRoute = require("../middlewares/authMiddleware");

router.get("/", getEventDetails);
router.post("/", protectRoute, createEvent);
router.put("/:id", protectRoute, updateEvent);
router.delete("/:id", protectRoute, deleteEvent);

module.exports = router;
