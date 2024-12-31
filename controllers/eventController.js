const mongoose = require("mongoose");
const Event = require("../models/Event");
const Admin = require("../models/Admin");
const Registration = require("../models/Registration");

const asyncHandler = require("../middlewares/asyncHandler");

// Get all events for the logged-in admin
exports.getEventDetails = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id).populate("events");

  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  res.status(200).json(admin.events);
});

// Get a single event by ID
exports.getSingleEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid Event" });
  }

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  res.status(200).json(event);
});

// Get total number of events for the logged-in admin
exports.getTotalEvents = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id);

  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  const totalEvents = admin.events.length;

  res.status(200).json({ success: true, totalEvents });
});

// Create event and assign to admin
exports.createEvent = asyncHandler(async (req, res) => {
  const { name, date, venue, description, capacity } = req.body;

  // Validate required fields
  if (!name || !date || !venue || !capacity) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  if (isNaN(Number(capacity)) || Number(capacity) <= 0) {
    return res.status(400).json({ success: false, message: "Capacity must be a positive number" });
  }

  // Check if a logo was uploaded
  const logoUrl = req.file ? req.file.path : null;

  // Create a new event
  const newEvent = await Event.create({ name, date, venue, description, logoUrl, capacity });

  // Find the admin and assign the event
  const admin = await Admin.findById(req.user.id);
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  admin.events.push(newEvent._id);
  await admin.save();

  // Return response with the registration link
  res.status(201).json({
    success: true,
    message: "Event created and assigned to admin successfully",
    event: newEvent,
  });
});

// Update event
exports.updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, date, venue, description, capacity } = req.body;

  // Check if the id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid event ID." });
  }

  if (capacity && (isNaN(Number(capacity)) || Number(capacity) <= 0)) {
    return res.status(400).json({ success: false, message: "Capacity must be a positive number" });
  }

  const admin = await Admin.findById(req.user.id);
  if (!admin.events.includes(id)) {
    return res.status(403).json({ success: false, message: "You are not authorized to update this event" });
  }

  // Check if a new logo was uploaded
  const logoUrl = req.file ? req.file.path : undefined;

  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    { name, date, venue, description, ...(capacity && { capacity }), ...(logoUrl && { logoUrl }) },
    { new: true }
  );

  if (!updatedEvent) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  res.status(200).json(updatedEvent);
});

// Delete event
exports.deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if the id is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid event ID" });
  }

  const admin = await Admin.findById(req.user.id);
  if (!admin.events.includes(id)) {
    return res.status(403).json({ success: false, message: "You are not authorized to delete this event" });
  }

  const registrationsCount = await Registration.countDocuments({ eventId: id });
  if (registrationsCount > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete an event with existing registrations",
    });
  }

  const deletedEvent = await Event.findByIdAndDelete(id);
  if (!deletedEvent) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Remove event from admin's events list
  admin.events = admin.events.filter((eventId) => eventId.toString() !== id);
  await admin.save();

  res.status(200).json({ message: "Event deleted successfully" });
});
