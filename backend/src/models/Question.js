// backend/src/models/Question.js

// imports
import mongoose from "mongoose";

// create question schema
const questionSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  label: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "multichoice", "file"],
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    required: true,
  },
});

// create question model
const Question = mongoose.model("Question", questionSchema);

// export question model
export default Question;
