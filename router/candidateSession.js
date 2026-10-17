const express = require("express");
const router = express.Router();
const Interview = require("../model/interview");
const InterviewQuestion = require("../model/interviewquestions");
const CandidateSession = require("../model/candidatesession");
const SessionQuestion = require("../model/sessionquestion");
const validateCandidateSession = require("../validations/candidateSession");

router.post("/:id/sessions", async (req, res) => {
  const { error, data } = validateCandidateSession(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    if (interview.status !== "PUBLISHED") return res.status(400).json({ message: "Interview is not open" });
    if (interview.expiresAt <= new Date()) return res.status(400).json({ message: "Interview link has expired" });

    const attempted = await CandidateSession.findOne({
      interviewId: interview._id,
      $or: [{ candidateEmail: data.candidateEmail }, { candidatePhone: data.candidatePhone }],
    });
    if (attempted) return res.status(400).json({ message: "You have already attempted this interview" });

    const interviewQuestions = await InterviewQuestion.find({ interviewId: interview._id }).sort("order");
    if (!interviewQuestions.length) return res.status(400).json({ message: "No questions available for this interview" });

    const remainingMinutes = Math.ceil((interview.expiresAt - Date.now()) / 60000);
    const duration = Math.min(interview.duration, remainingMinutes);

    const session = await CandidateSession.create({
      interviewId: interview._id,
      ...data,
      duration,
      status: "IN_PROGRESS",
      startedAt: new Date(),
    });

    const sessionQuestions = await SessionQuestion.insertMany(
      interviewQuestions.map((question) => ({
        sessionId: session._id,
        questionText: question.questionText,
        skill: question.skill,
        order: question.order,
      }))
    );

    res.status(201).json({
      message: "Session started successfully",
      session,
      questions: sessionQuestions,
    });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid interview id" });
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    console.error("Create session error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
