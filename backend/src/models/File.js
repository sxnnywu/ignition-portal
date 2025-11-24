// backend/src/models/File.js

// imports
import mongoose from "mongoose";

// create file schema
const fileSchema = mongoose.Schema({
    applicationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Application",
        required: true,
    },
    fileName: {
        type: String,
        required: true,
    },
    storagePath: {
        type: String,
        required: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
});

// create file model
const File = mongoose.model("File", fileSchema);

// export file model
export default File;
