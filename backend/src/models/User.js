// backend/src/models/User.js

// imports
import mongoose from "mongoose";

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
  },
  {
    timestamps: true, // mongo auto-generates createdAt and updatedAt
  }
);

// create user model
const User = mongoose.model("User", userSchema);

// export user model
export default User;
