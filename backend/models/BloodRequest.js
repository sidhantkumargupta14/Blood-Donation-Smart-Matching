const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  city: { type: String, required: true },
  hospital: { type: String, required: true },
  urgency: { type: String, enum: ["Low", "Medium", "High", "Emergency"], default: "Medium" },
  units: { type: Number, default: 1 },
  status: { type: String, enum: ["Open", "Matched", "Closed"], default: "Open" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("BloodRequest", requestSchema);
