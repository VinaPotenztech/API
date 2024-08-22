const express=require('express');
const userrouter=express.Router();
const {registerUser,loginUser,forgotPassword,resetPassword,changePassword,updateProfile,getAllUsers}=require('../controllers/userController');

userrouter.post("/register",registerUser);
userrouter.post("/login",loginUser);
userrouter.post("/forgot-password",forgotPassword);
userrouter.post("/reset-password",resetPassword);
userrouter.post("/change-password",changePassword);
userrouter.put("/update-profile",updateProfile);
userrouter.get("/users",getAllUsers);

module.exports=userrouter;
