const crypto=require("crypto");
const User=require("../models/user");
const { get } = require("http");
const { log } = require("console");

const registerUser=async(req,res)=>{
    const { firstname, lastname, email, password, country } = req.body;
    if (!firstname || !lastname || !email || !password || !country) {
      return res.status(400).json({ message: "All fields are required" });
    }
    try {
      const existinguser = await User.findOne({ email });
      if (existinguser) {
        return res.status(400).json({ message: "email already registered" });
      }
      const newUser = new User({ firstname, lastname, email, password, country });
      await newUser.save();
  
      res
        .status(201)
        .json({ message: "user registered successfully!", user: newUser });
    } catch (error) {
      res.status(500).json({ message: "Error registering user.", error });
    }
};

//Login
const loginUser=async(req,res) => {
    const { email, password } = req.body;
  
    // Basic validation
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }
  
    try {
      // Find user by email
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password." });
      }
  
      // Compare password
      if (password !== user.password) {
        return res.status(400).json({ message: "Invalid email or password." });
      }
  
      // Successful login
      res.status(200).json({ message: "Login successful!", user });
    } catch (error) {
      res.status(500).json({ message: "Error logging in.", error });
      console.log(error);
    }
};

const forgotPassword=async(req,res)=>{
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "user not found" });
      }
  
      //Generate a password reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
  
      //Save the token and its expiration time to the user record
      user.resetToken = resetToken;
      user.resetTokenExpiry = Date.now() + 3600000;
      await user.save();
  
      console.log(`Password reset token: ${resetToken}`);
  
      res
        .status(200)
        .json({ message: "Password reset token generated.", token: resetToken });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Error processing password reset  request", error });
      console.log(error);
    }
};

const resetPassword=async (req,res)=>{
    const { token, newPassword } = req.body;
  
    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }
  
    try {
      const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }
  
      //reset password
  
      user.password = newPassword;
      user.resetToken = null;
      user.resetTokenExpiry = null;
      await user.save();
  
      res.status(200).json({ message: "Password successfully reset." });
    } catch (error) {
      res.status(500).json({ message: "Error reseting password", error });
      console.log(error);
    }
};

const changePassword=async(req,res)=>{
    const { email, currentPassword, newPassword } = req.body;
  
    if (!email || !currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Email,current password, and new password required" });
    }
    try {
      //find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found." });
      }
  
      //check if current password is correct
      if (user.password !== currentPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
  
      //Update password
      user.password = newPassword;
      await user.save();
  
      res.status(200).json({ message: "Password successfully changed." });
    } catch (error) {
      res.status(500).json({ message: "Error changing password", error });
      console.log(error);
    }
} 

const updateProfile=async(req,res)=>{
   const {email,firstname,lastname,country}=req.body;

   if(!email || !firstname || !lastname ||  !country){
    return res.status(400).json({message:"Firstname,Lastname,email, and country are required"});
   }
   try {
    const user=await User.findOneAndUpdate(
      {email},
      {firstname,lastname,country},
      {new:true}
    );

    if(!user){
      return res.status(400).json({message:"User not found."});
    }
    res.status(200).json({message:"Profile updated successfully",user});

   } catch (error) {
    res.status(500).json({message:"Error updating profile",error});
    console.log(error);
    
   }
}

const getAllUsers=async(req,res)=>{
 try {
  const users=await User.find();
  res.status(200).json(users)
 } catch (error) {
    res.status(500).json({message:'Error fetching users',error})
 } 
};

module.exports={
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  getAllUsers,
}
