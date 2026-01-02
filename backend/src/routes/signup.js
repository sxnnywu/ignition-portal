// backend/src/routes/signup.js

// imports
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

export default router;