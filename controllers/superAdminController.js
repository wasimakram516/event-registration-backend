const Admin = require("../models/Admin");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const mongoose = require("mongoose");
const asyncHandler = require("../middlewares/asyncHandler");

// Get all admins excluding superadmin (Super Admin only)
exports.getAllAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find({ role: { $ne: "superadmin" } }).select(
    "-password"
  ); // Exclude passwords
  res.status(200).json(admins);
});

// Get all events for a specific admin (Super Admin only)
exports.getAdminEvents = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(adminId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid admin ID." });
  }

  const admin = await Admin.findById(adminId).populate("events");
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  res.status(200).json(admin.events);
});

// Get registrations for a specific event (Super Admin only)
exports.getEventRegistrations = asyncHandler(async (req, res) => {
  const { eventId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid event ID." });
  }

  const event = await Event.findById(eventId);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  const registrations = await Registration.find({ eventId });
  res.status(200).json(registrations);
});

// Update admin information (username, password)
exports.updateAdminInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid admin ID." });
  }

  if (!username && !password) {
    return res
      .status(400)
      .json({ success: false, message: "No updates provided" });
  }

  const updates = {};
  if (username) updates.username = username;
  if (password) updates.password = password;

  const admin = await Admin.findByIdAndUpdate(id, updates, {
    new: true,
  }).select("-password");
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  res.status(200).json({ success: true, message: "Admin info updated", admin });
});

// Update event details (Super Admin only)
exports.updateEventInfo = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, date, venue, description, capacity } = req.body;
  
    // Validate event ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid event ID." });
    }
  
    const updates = {};
    if (name) updates.name = name;
    if (date) updates.date = date;
    if (venue) updates.venue = venue;
    if (description) updates.description = description;
    if (capacity) {
      if (isNaN(Number(capacity)) || Number(capacity) <= 0) {
        return res
          .status(400)
          .json({ success: false, message: "Capacity must be a positive number" });
      }
      updates.capacity = capacity;
    }
  
    // Check if a logo file was uploaded
    if (req.file) {
      updates.logoUrl = req.file.path; // Assuming `Multer` saves the file path in `req.file.path`
    }
  
    // Update the event in the database
    const event = await Event.findByIdAndUpdate(id, updates, { new: true });
    if (!event) {
      return res
        .status(404)
        .json({ success: false, message: "Event not found" });
    }
  
    res
      .status(200)
      .json({
        success: true,
        message: "Event updated successfully",
        event,
      });
  });  

// Update registration details (Super Admin only)
exports.updateRegistrationInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, phone, email, company } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid registration ID." });
  }

  const updates = {};
  if (firstName) updates.firstName = firstName;
  if (lastName) updates.lastName = lastName;
  if (phone) updates.phone = phone;
  if (email) updates.email = email;
  if (company) updates.company = company;

  const registration = await Registration.findByIdAndUpdate(id, updates, {
    new: true,
  });
  if (!registration) {
    return res
      .status(404)
      .json({ success: false, message: "Registration not found" });
  }

  res.status(200).json({
    success: true,
    message: "Registration updated successfully",
    registration,
  });
});

// Delete an admin (Super Admin only)
exports.deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid admin ID." });
  }

  const admin = await Admin.findById(id);
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  // Check if the admin has associated events
  if (admin.events.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete admin. Admin has associated events.",
    });
  }

  await Admin.findByIdAndDelete(id);

  res
    .status(200)
    .json({ success: true, message: "Admin deleted successfully" });
});

// Delete an event (Super Admin only)
exports.deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid event ID." });
  }

  const event = await Event.findById(id);
  if (!event) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  // Check if the event has associated registrations
  const associatedRegistrations = await Registration.find({ eventId: id });
  if (associatedRegistrations.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Cannot delete event. Event has associated registrations.",
    });
  }

  await Event.findByIdAndDelete(id);

  res
    .status(200)
    .json({ success: true, message: "Event deleted successfully" });
});

// Delete a registration (Super Admin only)
exports.deleteRegistration = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid registration ID." });
  }

  const registration = await Registration.findByIdAndDelete(id);
  if (!registration) {
    return res
      .status(404)
      .json({ success: false, message: "Registration not found" });
  }

  res
    .status(200)
    .json({ success: true, message: "Registration deleted successfully" });
});
