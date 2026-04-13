// backend/src/models/User.js

// imports
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// create user schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["applicant", "reviewer", "admin"],
      default: "applicant",
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // mongo auto-generates createdAt and updatedAt
  }
);

// hash password before saving
userSchema.pre('save', async function (next) {

  // only hash if password is modified or new
  if (!this.isModified('password')) return next();

  // hash password
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } 
  // error handling
  catch (err) {
    next(err);
  }
});

// create user model
const User = mongoose.model("User", userSchema);

// export user model
export default User;
