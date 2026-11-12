const router = require("express").Router();
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

router.get("/", auth, async (req, res) => {
  try {
    const requests = await BloodRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const request = await BloodRequest.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json(request);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Smart matching: compatibility + urgency + distance + availability.
router.get("/:id/matches", auth, async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const allowed = compatibility[request.bloodGroup] || [request.bloodGroup];
    const donors = await Donor.find({
      available: true,
      bloodGroup: { $in: allowed }
    });

    const scored = donors.map(d => {
      let score = 0;

      // Blood group compatibility is the primary criterion.
      score += d.bloodGroup === request.bloodGroup ? 60 : 40;

      // Same city gets a strong location score.
      if (d.city.toLowerCase() === request.city.toLowerCase()) score += 25;
      else score += Math.max(0, 20 - Math.min(d.distanceKm, 20));

      // Emergency requests prioritize the nearest available donor.
      const urgencyBonus = { Low: 0, Medium: 5, High: 10, Emergency: 15 };
      score += urgencyBonus[request.urgency] || 0;

      return { donor: d, score: Math.round(score) };
    }).sort((a, b) => b.score - a.score);

    res.json(scored);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.patch("/:id/status", auth, async (req, res) => {
  try {
    const request = await BloodRequest.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    res.json(request);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
