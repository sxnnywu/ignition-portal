// backend/src/models/Application.js

// imports
import mongoose from 'mongoose';

// teammate sub-schema
// stored from a user-id lookup; name/email are copied from the referenced
// applicant at save time (the server is the source of truth, not the client)
const TeammateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
  },
  { _id: false },
);

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

    // Step 1 — basic info (first/last name come from the User, not stored here)
    personal: {
      gender: { type: String, default: '' },
      age: { type: Number, default: null },
      ethnicity: { type: String, default: '' },
      country: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
    },

    // Step 2 — education
    education: {
      institution: { type: String, default: '' },
      level: {
        type: String,
        enum: ['', 'high-school', 'undergraduate', 'graduate', 'bootcamp', 'other'],
        default: '',
      },
      program: { type: String, default: '' },
      coop: {
        type: String,
        enum: ['', 'yes', 'no'],
        default: '',
      },
    },

    // Step 3 — hackathon experience
    experience: {
      attended2025: {
        type: String,
        enum: ['', 'yes', 'no'],
        default: '',
      },
      hackathonsAttended: {
        type: Number,
        min: 0,
        max: 5,
        default: null,
      },
    },

    // Step 4 — teammates (optional, at most 3 → team of 4 with the applicant)
    teammates: {
      type: [TeammateSchema],
      default: [],
      validate: {
        validator: (v) => v.length <= 3,
        message: 'You can add at most 3 teammates.',
      },
    },

    // Step 5 — written responses
    responses: {
      admireDescribe: { type: String, maxlength: 100, default: '' },
      proudProject: { type: String, maxlength: 500, default: '' },
      motivation: { type: String, maxlength: 500, default: '' },
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// --- indexes ---
// one application per applicant; speeds GET /applications/me and the
// findOne({ userId }) lookup in POST /applications
ApplicationSchema.index({ userId: 1 });
// the admin list filters by status and sorts by submittedAt (desc); the status
// prefix of this compound also serves status-only reads (reviewer pool, stats, CSV)
ApplicationSchema.index({ status: 1, submittedAt: -1 });

// create application model
const Application = mongoose.model('Application', ApplicationSchema);

// export application model
export default Application;
