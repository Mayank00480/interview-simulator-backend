const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    jobRole: {
      type: String,
      required: true,
      trim: true,
    },

    jobDescription: {
      type: String,
      required: true,
      trim: true,
    },

    skills: {
      type: [String],
      required: true,
    },

    experienceLevel: {
      type: String,
      required: true,
      enum: ["Fresher", "Junior", "Mid-Level", "Senior"],
    },

    duration: {
      type: Number,
      required: true, // in minutes
    },

    questionCount: {
      type: Number,
      required: true,
      min: 1,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["DRAFT", "PUBLISHED", "CLOSED"],
      default: "DRAFT",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interview", interviewSchema);