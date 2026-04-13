// backend/src/routes/signup.js

// imports
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import express from "express";
import nodemailer from "nodemailer";
import crypto from "crypto";

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

// configure email transporter
function getEmailTransporter() {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
}

// forgot password route
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // check for missing email
    if (!email)
      return res.status(400).json({ message: "Email is required." });

    // find user by email
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "No user found with that email." });

    // generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // set token and expiration (valid for 1 hour)
    user.resetPasswordToken = tokenHash;
    user.resetPasswordExpiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    // construct reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    // send email
    const transporter = getEmailTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Instructions",
      html: `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p>
          <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link in your browser:</p>
        <p>${resetLink}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br>Ignition Portal Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    // respond with success
    res.status(200).json({
      message: "Password reset link sent to your email.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// reset password route
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    // check for missing fields
    if (!token || !password)
      return res.status(400).json({ message: "Token and password are required." });

    // hash the token to match database  
    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // find user by reset token and check expiration
    const user = await User.findOne({
      resetPasswordToken: tokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
    });

    if (!user)
      return res.status(400).json({
        message: "Invalid or expired password reset token.",
      });

    // validate password strength
    if (!isStrongPassword(password))
      return res.status(400).json({
        message:
          "Password must be at least 8 characters long and include at least one lowercase letter, one uppercase letter, and one number.",
      });

    // update password
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpiresAt = null;
    await user.save();

    // respond with success
    res.status(200).json({
      message: "Password reset successful. You can now login with your new password.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;