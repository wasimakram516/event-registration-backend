const Event = require("../models/Event");
const Admin = require("../models/Admin");
const asyncHandler = require("../middlewares/asyncHandler");

// Get all events for the logged-in admin
exports.getEventDetails = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id).populate("events");

  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  res.status(200).json(admin.events);
});

// Create event and assign to admin
exports.createEvent = asyncHandler(async (req, res) => {
  const { name, date, venue, description, logoUrl } = req.body;

  if (!name || !date || !venue) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  const newEvent = await Event.create({ name, date, venue, description, logoUrl });

  const admin = await Admin.findById(req.user.id);
  if (!admin) {
    return res.status(404).json({ success: false, message: "Admin not found" });
  }

  admin.events.push(newEvent._id);
  await admin.save();

  res.status(201).json({
    success: true,
    message: "Event created and assigned to admin successfully",
    event: newEvent,
  });
});

// Update event
exports.updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, date, venue, description, logoUrl } = req.body;

  const admin = await Admin.findById(req.user.id);
  if (!admin.events.includes(id)) {
    return res.status(403).json({ success: false, message: "You are not authorized to update this event" });
  }

  const updatedEvent = await Event.findByIdAndUpdate(
    id,
    { name, date, venue, description, logoUrl },
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

  const admin = await Admin.findById(req.user.id);
  if (!admin.events.includes(id)) {
    return res.status(403).json({ success: false, message: "You are not authorized to delete this event" });
  }

  const deletedEvent = await Event.findByIdAndDelete(id);
  if (!deletedEvent) {
    return res.status(404).json({ success: false, message: "Event not found" });
  }

  admin.events = admin.events.filter((eventId) => eventId.toString() !== id);
  await admin.save();

  res.status(200).json({ message: "Event deleted successfully" });
});
