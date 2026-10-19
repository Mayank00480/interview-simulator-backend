const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL = process.env.GEMINI_MODEL || "gemini-flash-lite-latest";

const generateQuestions = async ({ jobRole, jobDescription, skills, experienceLevel, questionCount }) => {
  const prompt = `Generate ${questionCount} interview questions for a ${experienceLevel} ${jobRole} role.
Job description: ${jobDescription}
Skills to assess: ${skills.join(", ")}
Each question must be clear, relevant, and appropriate for the experience level.
For each question, set skill to the exact skill it assesses, chosen only from the listed skills.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            questionText: { type: Type.STRING },
            skill: { type: Type.STRING },
          },
          required: ["questionText", "skill"],
        },
      },
    },
  });

  return JSON.parse(response.text);
};

const generateFollowUpQuestion = async ({ jobRole, skill, questionText, answer }) => {
  const prompt = `You are interviewing a candidate for the ${jobRole} role.
Question asked: ${questionText}
Candidate's answer: ${answer}
Ask one short follow-up question that digs deeper into the candidate's answer to better assess the skill: ${skill}.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questionText: { type: Type.STRING },
        },
        required: ["questionText"],
      },
    },
  });

  return JSON.parse(response.text).questionText;
};

const evaluateSession = async ({ jobRole, experienceLevel, questions }) => {
  const transcript = questions
    .map(
      (question, index) =>
        `Q${index + 1} [Skill: ${question.skill}]: ${question.questionText}\nAnswer: ${question.answer || "(no answer)"}`
    )
    .join("\n\n");

  const prompt = `You are evaluating a candidate's interview for the ${experienceLevel} ${jobRole} role.
Score each answer from 0 to 10 based on correctness, relevance, and depth. Score unanswered questions 0.
Interview transcript:
${transcript}
Return an overall score from 0 to 100, a score out of 10 for each skill, and a short overall evaluation.`;

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          skillScores: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                skill: { type: Type.STRING },
                score: { type: Type.NUMBER },
              },
              required: ["skill", "score"],
            },
          },
          evaluation: { type: Type.STRING },
        },
        required: ["overallScore", "skillScores", "evaluation"],
      },
    },
  });

  return JSON.parse(response.text);
};

module.exports = { generateQuestions, generateFollowUpQuestion, evaluateSession };
