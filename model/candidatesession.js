const mongoose = require("mongoose");
const validator = require("validator");

const candidateSessionSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },

    candidateName: {
      type: String,
      required: true,
      trim: true,
    },

    candidateEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value) => validator.isEmail(value),
        message: "Please enter a valid email address",
      },
    },

    candidatePhone: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "EXPIRED"],
      default: "PENDING",
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },

    overallScore: {
      type: Number,
      min: 0,
    },

    skillScores: [
      {
        skill: { type: String, required: true, trim: true },
        score: { type: Number, required: true, min: 0 },
        _id: false,
      },
    ],

    evaluation: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CandidateSession", candidateSessionSchema);
