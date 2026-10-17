const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateQuestions = async ({ jobRole, jobDescription, skills, experienceLevel, questionCount }) => {
  const prompt = `Generate ${questionCount} interview questions for a ${experienceLevel} ${jobRole} role.
Job description: ${jobDescription}
Skills to assess: ${skills.join(", ")}
Each question must be clear, relevant, and appropriate for the experience level.
For each question, set skill to the exact skill it assesses, chosen only from the listed skills.`;

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
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
    model: "gemini-flash-latest",
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

module.exports = { generateQuestions, generateFollowUpQuestion };
