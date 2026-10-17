const validateAnswer = (body = {}) => {
  const { questionId, answer } = body;

  if (!questionId) {
    return { error: "Please provide question id" };
  }

  if (!answer || typeof answer !== "string") {
    return { error: "Please provide an answer" };
  }

  return { data: { questionId, answer: answer.trim() } };
};

module.exports = validateAnswer;
