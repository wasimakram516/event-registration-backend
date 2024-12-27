const express = require("express");
const router = express.Router();
const protectRoute = require("../middlewares/authMiddleware");
const {
  adminLogin,
  getAdminDetails,
  registerAdmin,
  refreshToken,
  logoutAdmin,
} = require("../controllers/adminController");

// Admin registration route (one-time use or for adding more admins)
router.post("/register", registerAdmin);

// Admin login
router.post("/login", adminLogin);

// Refresh token
router.post("/refresh", refreshToken);

// Admin logout
router.post("/logout", logoutAdmin);

// Get admin details (protected route)
router.get("/me", protectRoute, getAdminDetails);

module.exports = router;
