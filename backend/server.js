const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const donorRoutes = require("./routes/donors");
const requestRoutes = require("./routes/requests");

const app = express();
const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean);
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return callback(null, true);
  return callback(new Error("Origin is not allowed by CORS"));
}}));
app.use(express.json({limit:"1mb"}));
app.get("/", (_req,res)=>res.json({message:"Blood Donation Smart Matching API is running"}));
app.get("/health", (_req,res)=>res.status(mongoose.connection.readyState===1?200:503).json({status:"ok",database:mongoose.connection.readyState===1?"connected":"disconnected"}));
app.use("/api/auth",authRoutes);
app.use("/api/donors",donorRoutes);
app.use("/api/requests",requestRoutes);

const PORT=process.env.PORT||5000;
if(process.env.NODE_ENV==="production"&&!process.env.JWT_SECRET) throw new Error("JWT_SECRET must be set in production");
if(process.env.NODE_ENV==="production"&&!process.env.MONGO_URI) throw new Error("MONGO_URI must be set in production");
app.listen(PORT,"0.0.0.0",()=>console.log(`API listening on port ${PORT}`));
mongoose.connect(process.env.MONGO_URI||"mongodb://127.0.0.1:27017/blood_donation")
 .then(()=>console.log("MongoDB connected"))
 .catch(err=>console.error("MongoDB connection failed:",err.message));
