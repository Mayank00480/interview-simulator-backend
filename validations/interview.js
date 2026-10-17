const EXPERIENCE_LEVELS = ["Fresher", "Junior", "Mid-Level", "Senior"];

const validateInterview = ({ jobRole, jobDescription, skills, experienceLevel, duration, questionCount, expiresAt }) => {
  if (!jobRole || !jobDescription || !Array.isArray(skills) || !skills.length || !experienceLevel || duration == null || questionCount == null || !expiresAt) {
    return "Please provide all required fields";
  }

  if (!EXPERIENCE_LEVELS.includes(experienceLevel)) {
    return "Invalid experience level";
  }

  if (!Number.isFinite(duration) || duration <= 0 || !Number.isInteger(questionCount) || questionCount < 1) {
    return "Invalid duration or question count";
  }

  if (Number.isNaN(new Date(expiresAt).getTime()) || new Date(expiresAt) <= new Date()) {
    return "Expiry date must be in the future";
  }

  return null;
};

module.exports = validateInterview;
