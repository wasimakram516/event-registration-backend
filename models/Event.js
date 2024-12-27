const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  description: { type: String },
  logoUrl: { type: String },
});

module.exports = mongoose.model("Event", EventSchema);
