const mongoose = require("mongoose");

const interviewQuestionSchema = new mongoose.Schema(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },

    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    skill: {
      type: String,
      required: true,
      trim: true,
    },

    order: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "InterviewQuestion",
  interviewQuestionSchema
);