const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  description: { type: String },
  logoUrl: { type: String },
  capacity: { type: Number, required: true, default: 100 }, // Maximum capacity for the event
  registrations: { type: Number, default: 0 }, // Count of current registrations
});

module.exports = mongoose.model("Event", EventSchema);
