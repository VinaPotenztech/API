//server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const User = require("./models/user");
const crypto = require("crypto");
const { log } = require("console");
require("dotenv").config();

const app = express();

const port = process.env.PORT || 3000;
const mongoUri = process.env.MONGO_URI;

app.use(bodyParser.json());

//connect to mongo
mongoose
  .connect(mongoUri, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Could not connect to Mongo", err));

//API route for registration
app.post("/api/register", async (req, res) => {
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
});

// server.js (Add this below the registration route)
app.post("/api/login", async (req, res) => {
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
});

//API route for password reset request
app.post("/api/forgot-password", async (req, res) => {
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
});

//API route for password reset
app.post("/api/reset-password", async (req, res) => {
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
});

//change password
app.post("/api/change-password", async (req, res) => {
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
});
//start server
app.listen(port, () => {
  console.log(`Server is runnign on http://localhost:${port}`);
});
