// backend/src/models/Application.js

// imports
import mongoose from 'mongoose';

// create application schema
const ApplicationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },

    status: {
      type: String,
      enum: [
        'draft',
        'submitted',
        'under_review',
        'accepted',
        'waitlisted',
        'rejected',
      ],
      default: 'draft',
    },

    version: {
      type: Number,
      default: 1,
    },

    answers: {
      type: Object,
      default: {},
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// create application model
const Application = mongoose.model('Application', ApplicationSchema);

// export application model
export default Application;
