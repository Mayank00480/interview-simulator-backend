const express = require("express");
const router = express.Router();
const CandidateSession = require("../model/candidatesession");
const SessionQuestion = require("../model/sessionquestion");
const validateAnswer = require("../validations/sessionAnswer");
const getSessionDeadline = require("../utils/sessionDeadline");

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

    res.json({ message: "Answer submitted successfully", question });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid session or question id" });
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    console.error("Submit answer error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
