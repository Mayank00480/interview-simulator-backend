const express = require("express");
const router = express.Router();
const CandidateSession = require("../model/candidatesession");
const SessionQuestion = require("../model/sessionquestion");
const Interview = require("../model/interview");
const validateAnswer = require("../validations/sessionAnswer");
const getSessionDeadline = require("../utils/sessionDeadline");
const { generateFollowUpQuestion, evaluateSession } = require("../utils/gemini");

router.post("/:id/complete", async (req, res) => {
  try {
    const session = await CandidateSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "IN_PROGRESS") {
      return res.status(400).json({ message: "Session is not active" });
    }

    const questions = await SessionQuestion.find({ sessionId: session._id }).sort("order");
    const interview = await Interview.findById(session.interviewId);

    if (interview) {
      try {
        const result = await evaluateSession({
          jobRole: interview.jobRole,
          experienceLevel: interview.experienceLevel,
          questions: questions.map((question) => ({
            questionText: question.questionText,
            skill: question.skill,
            answer: question.answer,
          })),
        });

        session.overallScore = result.overallScore;
        session.skillScores = result.skillScores;
        session.evaluation = result.evaluation;
      } catch (err) {
        console.error("Evaluate session error:", err);
      }
    }

    session.status = "COMPLETED";
    session.completedAt = new Date();
    await session.save();

    res.json({ message: "Session completed successfully", session });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid session id" });
    console.error("Complete session error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:id/answers", async (req, res) => {
  const { error, data } = validateAnswer(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const session = await CandidateSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    if (session.status !== "IN_PROGRESS") {
      return res.status(400).json({ message: "Session is not active" });
    }

    if (getSessionDeadline(session) <= new Date()) {
      session.status = "EXPIRED";
      await session.save();
      return res.status(400).json({ message: "Session has expired" });
    }

    const question = await SessionQuestion.findOneAndUpdate(
      { _id: data.questionId, sessionId: session._id },
      { answer: data.answer },
      { new: true, runValidators: true }
    );
    if (!question) return res.status(404).json({ message: "Question not found" });

    let followUp = null;

    if (!question.isFollowUp) {
      try {
        const interview = await Interview.findById(session.interviewId);
        const questionText = await generateFollowUpQuestion({
          jobRole: interview.jobRole,
          skill: question.skill,
          questionText: question.questionText,
          answer: data.answer,
        });

        const last = await SessionQuestion.findOne({ sessionId: session._id }).sort("-order");
        followUp = await SessionQuestion.create({
          sessionId: session._id,
          questionText,
          skill: question.skill,
          order: last.order + 1,
          isFollowUp: true,
        });
      } catch (err) {
        console.error("Generate follow-up error:", err);
      }
    }

    res.json({
      message: "Answer submitted successfully",
      question,
      followUp,
      isFollowUpAnswered: question.isFollowUp,
    });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid session or question id" });
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    console.error("Submit answer error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
