const router = require("express").Router();
const mongoose = require("mongoose");
const BloodRequest = require("../models/BloodRequest");
const Donor = require("../models/Donor");
const { auth } = require("../middleware/auth");

const compatibility = {
  "A+": ["A+", "A-", "O+", "O-"],
  "A-": ["A-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
  "AB-": ["A-", "B-", "AB-", "O-"],
  "O+": ["O+", "O-"],
  "O-": ["O-"]
};
const editableFields = ["patientName", "bloodGroup", "city", "hospital", "urgency", "units"];

function requestInput(body) {
  const input = {};
  for (const field of editableFields) {
    if (body[field] !== undefined) input[field] = body[field];
  }
  if (typeof input.patientName === "string") input.patientName = input.patientName.trim();
  if (typeof input.city === "string") input.city = input.city.trim();
  if (typeof input.hospital === "string") input.hospital = input.hospital.trim();
  return input;
}

// A signed-in user sees only requests they created.
router.get("/", auth, async (req, res) => {
  try {
    const requests = await BloodRequest.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (e) {
    res.status(500).json({ message: "Unable to load blood requests" });
  }
});

// View one request. Requests are private to their creator.
router.get("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Request not found" });
    const request = await BloodRequest.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (e) {
    res.status(500).json({ message: "Unable to load this request" });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const request = await BloodRequest.create({ ...requestInput(req.body), createdBy: req.user.id });
    res.status(201).json(request);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Update request details without allowing clients to change ownership.
router.put("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Request not found" });
    const updates = requestInput(req.body);
    const request = await BloodRequest.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found or you do not have permission to edit it" });
    res.json(request);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Delete only a request owned by the signed-in user.
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Request not found" });
    const request = await BloodRequest.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
    if (!request) return res.status(404).json({ message: "Request not found or you do not have permission to delete it" });
    res.json({ message: "Blood request deleted successfully", id: request._id });
  } catch (e) {
    res.status(500).json({ message: "Unable to delete this request" });
  }
});

// Smart matching: compatibility + urgency + distance + availability.
router.get("/:id/matches", auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Request not found" });
    const request = await BloodRequest.findOne({ _id: req.params.id, createdBy: req.user.id });
    if (!request) return res.status(404).json({ message: "Request not found" });

    const allowed = compatibility[request.bloodGroup] || [request.bloodGroup];
    const donors = await Donor.find({ available: true, bloodGroup: { $in: allowed } });

    const scored = donors.map(d => {
      let score = d.bloodGroup === request.bloodGroup ? 60 : 40;
      if (d.city.toLowerCase() === request.city.toLowerCase()) score += 25;
      else score += Math.max(0, 20 - Math.min(d.distanceKm, 20));
      const urgencyBonus = { Low: 0, Medium: 5, High: 10, Emergency: 15 };
      score += urgencyBonus[request.urgency] || 0;
      return { donor: d, score: Math.round(score) };
    }).sort((a, b) => b.score - a.score);

    res.json(scored);
  } catch (e) {
    res.status(500).json({ message: "Unable to find compatible donors" });
  }
});

router.patch("/:id/status", auth, async (req, res) => {
  try {
    const allowedStatuses = ["Open", "Matched", "Closed"];
    if (!allowedStatuses.includes(req.body.status)) return res.status(400).json({ message: "Invalid request status" });
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ message: "Request not found" });
    const request = await BloodRequest.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      { $set: { status: req.body.status } },
      { new: true, runValidators: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found" });
    res.json(request);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

module.exports = router;
