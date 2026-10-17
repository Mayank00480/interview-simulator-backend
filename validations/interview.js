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

const validateInterviewUpdate = (body) => {
  const allowed = ["jobRole", "jobDescription", "skills", "experienceLevel", "duration", "questionCount", "expiresAt"];
  const data = Object.fromEntries(Object.entries(body).filter(([field]) => allowed.includes(field)));

  const { jobRole, jobDescription, skills, experienceLevel, duration, questionCount, expiresAt } = data;

  if (!Object.keys(data).length) {
    return { error: "Please provide at least one field to update" };
  }

  if (jobRole !== undefined && !jobRole) {
    return { error: "Invalid job role" };
  }

  if (jobDescription !== undefined && !jobDescription) {
    return { error: "Invalid job description" };
  }

  if (skills !== undefined && (!Array.isArray(skills) || !skills.length)) {
    return { error: "Invalid skills" };
  }

  if (experienceLevel !== undefined && !EXPERIENCE_LEVELS.includes(experienceLevel)) {
    return { error: "Invalid experience level" };
  }

  if (duration !== undefined && (!Number.isFinite(duration) || duration <= 0)) {
    return { error: "Invalid duration" };
  }

  if (questionCount !== undefined && (!Number.isInteger(questionCount) || questionCount < 1)) {
    return { error: "Invalid question count" };
  }

  if (expiresAt !== undefined && (Number.isNaN(new Date(expiresAt).getTime()) || new Date(expiresAt) <= new Date())) {
    return { error: "Expiry date must be in the future" };
  }

  return { data };
};

module.exports = { validateInterview, validateInterviewUpdate };
