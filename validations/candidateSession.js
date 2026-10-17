const validator = require("validator");

const validateCandidateSession = (body = {}) => {
  const { candidateName, candidateEmail, candidatePhone } = body;

  if (!candidateName || typeof candidateName !== "string") {
    return { error: "Please provide candidate name" };
  }

  if (!candidateEmail || !validator.isEmail(candidateEmail)) {
    return { error: "Please provide a valid email" };
  }

  if (!candidatePhone || typeof candidatePhone !== "string") {
    return { error: "Please provide candidate phone" };
  }

  return {
    data: {
      candidateName: candidateName.trim(),
      candidateEmail: candidateEmail.trim().toLowerCase(),
      candidatePhone: candidatePhone.trim(),
    },
  };
};

module.exports = validateCandidateSession;
