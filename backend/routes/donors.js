const router = require("express").Router();
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

router.get("/", async (req, res) => {
  try {
    const { bloodGroup, city } = req.query;
    const query = { available: true };
    if (bloodGroup) query.bloodGroup = { $in: compatibility[bloodGroup] || [bloodGroup] };
    if (city) query.city = new RegExp(city, "i");

    const donors = await Donor.find(query).sort({ distanceKm: 1 });
    res.json(donors);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/", auth, async (req, res) => {
  try {
    const donor = await Donor.create({ ...req.body, userId: req.user.id });
    res.status(201).json(donor);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

router.put("/:id/availability", auth, async (req, res) => {
  try {
    const donor = await Donor.findById(req.params.id);
    if (!donor) return res.status(404).json({ message: "Donor not found" });
    donor.available = !donor.available;
    await donor.save();
    res.json(donor);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
