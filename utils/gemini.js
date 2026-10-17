const { GoogleGenAI, Type } = require("@google/genai");

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateQuestions = async ({ jobRole, jobDescription, skills, experienceLevel, questionCount }) => {
  const prompt = `Generate ${questionCount} interview questions for a ${experienceLevel} ${jobRole} role.
Job description: ${jobDescription}
Skills to assess: ${skills.join(", ")}
Each question must be clear, relevant, and appropriate for the experience level.`;

  const response = await ai.models.generateContent({
    model: "gemini-flash-latest",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
  });

  return JSON.parse(response.text);
};

module.exports = generateQuestions;
