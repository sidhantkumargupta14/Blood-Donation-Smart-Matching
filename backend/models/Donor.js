const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    required: true
  },
  city: { type: String, required: true },
  distanceKm: { type: Number, default: 0 },
  phone: { type: String, required: true },
  available: { type: Boolean, default: true },
  lastDonation: { type: Date },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

module.exports = mongoose.model("Donor", donorSchema);
