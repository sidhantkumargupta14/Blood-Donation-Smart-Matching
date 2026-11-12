const router=require("express").Router();
const jwt=require("jsonwebtoken");
const bcrypt=require("bcryptjs");
const User=require("../models/User");
function tokenFor(user){return jwt.sign({id:user._id,name:user.name,role:user.role},process.env.JWT_SECRET||"local-development-only-secret",{expiresIn:"2d"});}
router.post("/register",async(req,res)=>{
 try{
  const name=String(req.body.name||"").trim(),email=String(req.body.email||"").toLowerCase().trim(),password=String(req.body.password||"");
  if(!name||!email||!password)return res.status(400).json({message:"All fields are required"});
  if(password.length<8)return res.status(400).json({message:"Password must be at least 8 characters"});
  if(await User.findOne({email}))return res.status(409).json({message:"Email already registered"});
  const user=await User.create({name,email,password:await bcrypt.hash(password,12)});
  return res.status(201).json({token:tokenFor(user),user:{id:user._id,name:user.name,email:user.email,role:user.role}});
 }catch(e){if(e.code===11000)return res.status(409).json({message:"Email already registered"});return res.status(500).json({message:"Unable to register account"});}
});
router.post("/login",async(req,res)=>{
 try{
  const email=String(req.body.email||"").toLowerCase().trim(),password=String(req.body.password||""),user=await User.findOne({email});
  if(!user)return res.status(401).json({message:"Invalid email or password"});
  const hashed=/^\$2[aby]\$/.test(user.password),valid=hashed?await bcrypt.compare(password,user.password):password===user.password;
  if(!valid)return res.status(401).json({message:"Invalid email or password"});
  if(!hashed){user.password=await bcrypt.hash(password,12);await user.save();}
  return res.json({token:tokenFor(user),user:{id:user._id,name:user.name,email:user.email,role:user.role}});
 }catch(e){return res.status(500).json({message:"Unable to log in"});}
});
module.exports=router;
