// backend/src/routes/signup.js

// imports
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import express from "express";

// create router
const router = express.Router();

// validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// password validation
// - at least 8 characters
// - at least 1 lowercase letter
// - at least 1 uppercase letter
// - at least 1 number
function isStrongPassword(password) {
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
}

// signup route
router.post("/signup", async (req, res) => {

  try {
    const { name, email, password } = req.body;

    // check for missing fields
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required." });

    // validate email format
    if (!isValidEmail(email))
      return res.status(400).json({ message: "Invalid email format." });

    // check if email is already in use
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already in use." });

    // validate password strength
    if (!isStrongPassword(password))
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one number.",
      });

    // if JWT_SECRET is not defined, throw error
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    // create user
    const user = await User.create({
      name,
      email,
      password,
      role: "applicant",
    });

    // generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // respond with user and token
    res.status(201).json({
      message: "Signup successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  }
  // error handling
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// reviewer signup route
router.post("/signup/reviewer", async (req, res) => {

  try {
    const { name, email, password, secret } = req.body;

    // check for missing fields
    if (!name || !email || !password || !secret)
      return res.status(400).json({ message: "All fields are required." });

    // validate email format
    if (!isValidEmail(email))
      return res.status(400).json({ message: "Invalid email format." });

    // check if email is already in use
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already in use." });

    // validate password strength
    if (!isStrongPassword(password))
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one number.",
      });

    // if JWT_SECRET is not defined, throw error
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    // verify secret
    if (secret !== process.env.REVIEWER_SIGNUP_SECRET) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    // create user
    const user = await User.create({
      name,
      email,
      password,
      role: "reviewer",
    });

    // generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // respond with user and token
    res.status(201).json({
      message: "Signup successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  }
  // error handling
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// admin signup route
router.post("/signup/admin", async (req, res) => {

  try {
    const { name, email, password, secret } = req.body;

    // check for missing fields
    if (!name || !email || !password || !secret)
      return res.status(400).json({ message: "All fields are required." });

    // validate email format
    if (!isValidEmail(email))
      return res.status(400).json({ message: "Invalid email format." });

    // check if email is already in use
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "Email already in use." });

    // validate password strength
    if (!isStrongPassword(password))
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one number.",
      });

    // if JWT_SECRET is not defined, throw error
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    // verify secret
    if (secret !== process.env.ADMIN_SIGNUP_SECRET) {
      return res.status(403).json({ message: "Unauthorized." });
    }

    // create user
    const user = await User.create({
      name,
      email,
      password,
      role: "admin",
    });

    // generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // respond with user and token
    res.status(201).json({
      message: "Signup successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  }
  // error handling
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // check for missing fields
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    // find user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ message: "No user found with that email." });

    // compare passwords
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(401).json({ message: "Incorrect password." });

    // generate JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // respond with user and token
    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// forgot password route — generates a reset token and emails it to the user
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Email is required." });

    const user = await User.findOne({ email });

    // always respond with success to avoid leaking whether an email is registered
    if (!user)
      return res.status(200).json({ message: "If that email exists, a reset link has been sent." });

    // generate a secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // store hashed token and 1-hour expiry on user
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // build reset link — raw token goes in the URL, never the hashed one
    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    // send email (non-fatal in dev — bad creds won't block the response)
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Ignition Hacks" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Reset your Ignition Hacks password",
        html: `
          <p>Hi ${user.name},</p>
          <p>You requested a password reset. Click the link below to set a new password. This link expires in 1 hour.</p>
          <p><a href="${resetUrl}">${resetUrl}</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        `,
      });
    } catch (emailErr) {
      console.error("Email send failed:", emailErr.message);
    }

    const response = { message: "If that email exists, a reset link has been sent." };
    // DEV ONLY: return raw token so we can test reset-password without real email creds
    if (process.env.NODE_ENV !== "production") response._devResetUrl = resetUrl;
    res.status(200).json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// reset password route — validates token and updates the user's password
router.post("/reset-password", async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword)
      return res.status(400).json({ message: "All fields are required." });

    if (!isStrongPassword(newPassword))
      return res.status(400).json({
        message: "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one number.",
      });

    // hash the incoming raw token to compare against the stored hashed token
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({ message: "Invalid or expired reset link." });

    // update password and clear the reset token fields
    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ message: "Password reset successful." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;