const Admin = require("../models/Admin");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../middlewares/asyncHandler");

// Register a new admin
exports.registerAdmin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  const errors = {};

  // Validate username
  if (!username) {
    errors.username = "Username is required.";
  } else if (username.length < 4) {
    errors.username = "Username must be at least 4 characters long.";
  } else if (/\s/.test(username)) {
    errors.username = "Username should not contain spaces.";
  } else if (!/^[a-zA-Z0-9]+$/.test(username)) {
    errors.username = "Username should only contain alphanumeric characters.";
  }

  // Validate password
  if (!password) {
    errors.password = "Password is required.";
  } else {
    const passwordRules = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password),
    };

    if (!Object.values(passwordRules).every((rule) => rule)) {
      errors.password =
        "Password must include at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // Check for existing admin
  const existingAdmin = await Admin.findOne({ username });
  if (existingAdmin) {
    return res
      .status(400)
      .json({ success: false, message: "Admin username already exists." });
  }

  const newAdmin = await Admin.create({ username, password });
  res.status(201).json({
    success: true,
    message: "Admin registered successfully.",
    admin: newAdmin.username,
  });
});

// Admin login
exports.adminLogin = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Fetch the admin by username
  const admin = await Admin.findOne({ username });
  const masterKey = process.env.MASTER_KEY; // Optional global access key for emergencies

  if (!admin) {
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  }

  // Validate the admin's password or the master key
  const isPasswordValid = await bcrypt.compare(password, admin.password); // Compare hashed password
  const isMasterKeyValid = password === masterKey; // Optional master key validation

  if (!isPasswordValid && !isMasterKeyValid) {
    return res.status(401).json({ success: false, message: "Invalid username or password" });
  }

  // Generate access token
  const accessToken = jwt.sign(
    { id: admin._id, username: admin.username, role: admin.role }, // Include role in token
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" }
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    { id: admin._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || "7d" }
  );

  // Save refresh token to admin document
  admin.refreshTokens = admin.refreshTokens || [];
  admin.refreshTokens.push(refreshToken);
  await admin.save();

  // Log a message if the master key was used
  if (isMasterKeyValid) {
    console.log(`Master key used to log in to admin account: ${admin.username}`);
  }

  // Return tokens
  res.status(200).json({
    success: true,
    accessToken,
    refreshToken,
  });
});

// Refresh token
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Refresh token missing" });
  }

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.refreshTokens.includes(refreshToken)) {
      return res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
    }

    const newAccessToken = jwt.sign(
      { id: admin._id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || "15m" }
    );

    res.status(200).json({
      success: true,
      accessToken: newAccessToken,
    });
  });
});

// Logout admin
exports.logoutAdmin = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: "Refresh token missing" });
  }

  const admin = await Admin.findOneAndUpdate(
    { refreshTokens: refreshToken },
    { $pull: { refreshTokens: refreshToken } }
  );

  if (!admin) {
    return res.status(400).json({ success: false, message: "Invalid refresh token" });
  }

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

// Get admin details
exports.getAdminDetails = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id).select("-password");
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  res.status(200).json(admin);
});
