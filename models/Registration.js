const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  company: { type: String },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
});

module.exports = mongoose.model("Registration", RegistrationSchema);
