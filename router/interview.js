const express = require("express");
const router = express.Router();
const Interview = require("../model/interview");
const auth = require("../middleware/userAuth");
const { validateInterviewUpdate, validateInterview} = require("../validations/interview");

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

module.exports = router;
