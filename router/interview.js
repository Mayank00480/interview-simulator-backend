const express = require("express");
const router = express.Router();
const Interview = require("../model/interview");
const InterviewQuestion = require("../model/interviewquestions");
const auth = require("../middleware/userAuth");
const { validateInterviewUpdate, validateInterview} = require("../validations/interview");
const validateQuestionUpdate = require("../validations/interviewQuestions");
const { generateQuestions } = require("../utils/gemini");

router.post("/", auth, async (req, res) => {
  const error = validateInterview(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const interview = await Interview.create({
      adminId: req.user._id,
      ...req.body,
      expiresAt: new Date(req.body.expiresAt),
    });
    res.status(201).json({ message: "Interview created successfully", interview });
  } catch (err) {
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    console.error("Create interview error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const interviews = await Interview.find({ adminId: req.user._id }).select("-adminId");
    res.json({ interviews });
  } catch (err) {
    console.error("Get interviews error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id", auth, async (req, res) => {
  const { error, data } = validateInterviewUpdate(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, adminId: req.user._id },
      data,
      { new: true, runValidators: true }
    ).select("-adminId");
    if (!interview) return res.status(404).json({ message: "Interview not found" });
    res.json({ message: "Interview updated successfully", interview });
  } catch (err) {
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid interview id" });
    console.error("Update interview error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:id/publish", auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, adminId: req.user._id }).select("-adminId");
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const hasQuestions = await InterviewQuestion.exists({ interviewId: interview._id });
    if (!hasQuestions) return res.status(400).json({ message: "Generate questions before publishing" });

    interview.status = "PUBLISHED";
    await interview.save();

    res.json({ message: "Interview published successfully", interview });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid interview id" });
    console.error("Publish interview error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/:id/generate-questions", auth, async (req, res) => {
  try {
    const interview = await Interview.findOne({ _id: req.params.id, adminId: req.user._id });
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const questions = await generateQuestions(interview);

    await InterviewQuestion.deleteMany({ interviewId: interview._id });
    const saved = await InterviewQuestion.insertMany(
      questions.map((question, index) => ({
        interviewId: interview._id,
        questionText: question.questionText,
        skill: question.skill,
        order: index + 1,
      }))
    );

    res.json({ message: "Questions generated successfully", questions: saved });
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid interview id" });
    console.error("Generate questions error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:id/questions/:questionId", auth, async (req, res) => {
  const { error, data } = validateQuestionUpdate(req.body);
  if (error) return res.status(400).json({ message: error });

  try {
    const interview = await Interview.findOne({ _id: req.params.id, adminId: req.user._id });
    if (!interview) return res.status(404).json({ message: "Interview not found" });

    const question = await InterviewQuestion.findOneAndUpdate(
      { _id: req.params.questionId, interviewId: interview._id },
      data,
      { new: true, runValidators: true }
    );
    if (!question) return res.status(404).json({ message: "Question not found" });

    res.json({ message: "Question updated successfully", question });
  } catch (err) {
    if (err.name === "ValidationError") return res.status(400).json({ message: err.message });
    if (err.name === "CastError") return res.status(400).json({ message: "Invalid interview or question id" });
    console.error("Update question error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
