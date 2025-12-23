// backend/src/models/Review.js

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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    scores: {
        type: Map,
        of: Number, // each questionKey maps to a numeric level
        required: true,
    },
    totalScore: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// automatically update updatedAt on save
reviewSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// create review model
const Review = mongoose.model("Review", reviewSchema);

// export review model
export default Review;