const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const authRoutes = require("./routes/auth");
const donorRoutes = require("./routes/donors");
const requestRoutes = require("./routes/requests");
const aiRoutes = require("./routes/ai");

const app = express();
const allowedOrigins = new Set(["https://bloodconnect-live.onrender.com", ...(process.env.CORS_ORIGINS || "").split(",").map(x => x.trim()).filter(Boolean)]);
app.use(cors({ origin(origin, callback) {
  if (!origin || allowedOrigins.has(origin) || /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) return callback(null, true);
  return callback(new Error("Origin is not allowed by CORS"));
}}));
app.use(express.json({limit:"1mb"}));
app.get("/", (_req,res)=>res.json({message:"Blood Donation Smart Matching API is running"}));
app.get("/health", (_req,res)=>res.status(mongoose.connection.readyState===1?200:503).json({status:"ok",database:mongoose.connection.readyState===1?"connected":"disconnected"}));
app.use("/api/auth",authRoutes);
app.use("/api/donors",donorRoutes);
app.use("/api/requests",requestRoutes);
app.use("/api/ai",aiRoutes);

const PORT=process.env.PORT||5000;
if(process.env.NODE_ENV==="production"&&!process.env.JWT_SECRET) throw new Error("JWT_SECRET must be set in production");
if(process.env.NODE_ENV==="production"&&!process.env.MONGO_URI) throw new Error("MONGO_URI must be set in production");
app.listen(PORT,"0.0.0.0",()=>console.log(`API listening on port ${PORT}`));

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI diagnostics: variable is missing");
} else {
  console.log("MongoDB URI diagnostics:", {
    startsWithMongo: uri.startsWith("mongodb://"),
    startsWithMongoSrv: uri.startsWith("mongodb+srv://"),
    leadingWhitespace: uri !== uri.trim(),
    containsQuotes: uri.includes('"') || uri.includes("'"),
    length: uri.length
  });

  mongoose.connect(uri)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection failed:", err.message));
}
