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

    // hash password
    const hashed = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
      name,
      email,
      password: hashed,
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

export default router;
