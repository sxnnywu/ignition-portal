// backend/src/models/File.js

// imports
import mongoose from "mongoose";

// create review schema
const reviewSchema = mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        required: true,
    },
    reviewerId: {
        type: String,
        ref: "User",
        required: true,
    },
    score: {
        type: Number,
        required: true,
    },
    comments: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// create review model
const Review = mongoose.model("Review", reviewSchema);

// export review model
export default Review;