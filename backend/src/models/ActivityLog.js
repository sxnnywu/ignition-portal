// backend/src/models/ActivityLog.js

// imports
import mongoose from "mongoose";

// create activityLog schema
const activityLogSchema = mongoose.Schema({
    actorId: {
        type: String,
        ref: "User",
        required: true,
    },
    action: {
        type: String,
        // enums: ["applicant edit", "applicant submit", "reviewer comment"] 
        required: true,
    },
    meta: {
        type: String,
        required: false, // metadata not needed for applicant submit? -need clarification
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// create activityLog model
const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

// export activityLog model
export default ActivityLog;