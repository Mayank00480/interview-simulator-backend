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

module.exports = generateQuestions;
