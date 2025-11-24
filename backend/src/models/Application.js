// backend/src/models/File.js

// imports
import mongoose from "mongoose";

// create application schema
const applicationSchema = mongoose.Schema({});

// create application model
const Application = mongoose.model("Application", applicationSchema);

// export application model
export default Application;
