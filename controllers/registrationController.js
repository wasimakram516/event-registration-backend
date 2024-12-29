const mongoose = require("mongoose");
const Registration = require("../models/Registration");
const Event = require("../models/Event");
const Admin = require("../models/Admin");
const asyncHandler = require("../middlewares/asyncHandler");

// Create a new registration
exports.createRegistration = asyncHandler(async (req, res) => {
  const { firstName, lastName, phone, email, company, eventId } = req.body;

  if (!firstName || !lastName || !phone || !email || !eventId) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const eventExists = await Event.findById(eventId);
  if (!eventExists) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  const existingRegistration = await Registration.findOne({ email, eventId });
  if (existingRegistration) {
    return res.status(409).json({ success: false, message: "User already registered for this event" });
  }

  const newRegistration = await Registration.create({
    firstName,
    lastName,
    phone,
    email,
    company,
    eventId,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: newRegistration,
  });
});

// Get all registrations (Admin-only, filtered by admin's events)
exports.getRegistrations = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id).populate("events");

  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  const registrations = await Registration.find({
    eventId: { $in: admin.events.map((event) => event._id) },
  }).populate("eventId", "name date venue");

  res.status(200).json(registrations);
});

// Get registrations for a specific event
exports.getRegistrationsByEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  // Check if the id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res.status(400).json({ success: false, message: "Invalid Event" });
  }

  const registrations = await Registration.find({ eventId }).populate("eventId", "name date venue");

  if (!registrations) {
    return res.status(404).json({ success: false, message: "No registrations found for this event" });
  }

  res.status(200).json({ success: true, data: registrations });
});

// Get total number of registrations for the logged-in admin
exports.getTotalRegistrations = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id).populate("events");

  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  const registrations = await Registration.find({
    eventId: { $in: admin.events.map((event) => event._id) },
  });

  res.status(200).json({ success: true, totalRegistrations: registrations.length });
});


// Delete a registration by ID
exports.deleteRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if the id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid registration ID" });
  }

  const registration = await Registration.findById(id);
  if (!registration) {
    return res.status(404).json({ success: false, message: "Registration not found" });
  }

  const admin = await Admin.findById(req.user.id).populate("events");
  if (!admin.events.some((event) => event._id.toString() === registration.eventId.toString())) {
    return res.status(403).json({ success: false, message: "You are not authorized to delete this registration" });
  }

  await Registration.findByIdAndDelete(id);
  res.status(200).json({ message: "Registration deleted successfully" });
});
