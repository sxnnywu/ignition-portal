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
    comment: {
        type: String,
        default: "",
        trim: true,
        maxlength: 2000,
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

// --- indexes ---
// a reviewer's own queue / per-reviewer lookups (GET /applications/reviewer,
// the appsReviewed count in /admin/users)
reviewSchema.index({ reviewerId: 1 });
// one review per (application, reviewer): a unique DB backstop behind the code
// check in POST /applications/:id/review. The applicationId prefix also serves
// "all reviews for an application" reads (GET /:id/reviews, the admin $lookups).
reviewSchema.index({ applicationId: 1, reviewerId: 1 }, { unique: true });

// create review model
const Review = mongoose.model("Review", reviewSchema);

// export review model
export default Review;