const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const protectRoute = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    // Check if the token exists
    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, token missing" });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user details to the request
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin) {
      return res.status(401).json({ success: false, message: "Not authorized, user not found" });
    }

    req.user = admin; // Add user data to request object
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Not authorized, token invalid" });
  }
};

module.exports = protectRoute;
