const validateQuestionUpdate = (body = {}) => {
  const { questionText, skill, order } = body;

  if (!questionText || typeof questionText !== "string") {
    return { error: "Please provide question text" };
  }

  if (!skill || typeof skill !== "string") {
    return { error: "Please provide a skill" };
  }

  if (!Number.isInteger(order) || order < 1) {
    return { error: "Please provide a valid order" };
  }

  return { data: { questionText, skill, order } };
};

module.exports = validateQuestionUpdate;
