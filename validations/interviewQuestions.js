const validateQuestionAdd = (body = {}) => {
  const { questionText, skill, order } = body;

  if (!questionText || typeof questionText !== "string" || !questionText.trim()) {
    return { error: "Please provide question text" };
  }

  if (!skill || typeof skill !== "string" || !skill.trim()) {
    return { error: "Please provide a skill" };
  }

  if (order !== undefined && (!Number.isInteger(order) || order < 1)) {
    return { error: "Please provide a valid order" };
  }

  const data = {
    questionText: questionText.trim(),
    skill: skill.trim(),
  };

  if (order !== undefined) {
    data.order = order;
  }

  return { data };
};

const validateQuestionUpdate = (body = {}) => {
  const allowed = ["questionText", "skill", "order"];
  const data = Object.fromEntries(
    Object.entries(body).filter(([field]) => allowed.includes(field))
  );

  if (!Object.keys(data).length) {
    return { error: "Please provide at least one field to update" };
  }

  if (data.questionText !== undefined) {
    if (!data.questionText || typeof data.questionText !== "string" || !data.questionText.trim()) {
      return { error: "Please provide question text" };
    }
    data.questionText = data.questionText.trim();
  }

  if (data.skill !== undefined) {
    if (!data.skill || typeof data.skill !== "string" || !data.skill.trim()) {
      return { error: "Please provide a skill" };
    }
    data.skill = data.skill.trim();
  }

  if (data.order !== undefined) {
    if (!Number.isInteger(data.order) || data.order < 1) {
      return { error: "Please provide a valid order" };
    }
  }

  return { data };
};

validateQuestionUpdate.validateQuestionAdd = validateQuestionAdd;
validateQuestionUpdate.validateQuestionUpdate = validateQuestionUpdate;

module.exports = {
  validateQuestionAdd,
  validateQuestionUpdate,
};
