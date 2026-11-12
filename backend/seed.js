const mongoose = require("mongoose");
require("dotenv").config();
const Donor = require("./models/Donor");

const donors = [
  { name: "Aman Sharma", bloodGroup: "O+", city: "Kharar", distanceKm: 2, phone: "9876543210", available: true },
  { name: "Priya Singh", bloodGroup: "A+", city: "Mohali", distanceKm: 8, phone: "9876543211", available: true },
  { name: "Rahul Kumar", bloodGroup: "B+", city: "Kharar", distanceKm: 3, phone: "9876543212", available: true },
  { name: "Neha Verma", bloodGroup: "O-", city: "Chandigarh", distanceKm: 15, phone: "9876543213", available: true },
  { name: "Arjun Mehta", bloodGroup: "AB+", city: "Mohali", distanceKm: 6, phone: "9876543214", available: true }
];

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/blood_donation")
  .then(async () => {
    await Donor.deleteMany({});
    await Donor.insertMany(donors);
    console.log("Sample donors inserted");
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
