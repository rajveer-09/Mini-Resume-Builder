import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

export const polishText = async (text: string, context: string = "resume section"): Promise<string> => {
  if (!text) return "";

  try {
    const prompt = `
      You are an expert resume writer. 
      Rewrite the following ${context} text to be more professional, concise, and action-oriented. 
      Do not add any conversational filler. Just return the polished text.
      
      Original text:
      "${text}"
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text?.trim() || text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return text; // Fallback to original
  }
};

export const generateSummary = async (currentData: any): Promise<string> => {
  try {
    const prompt = `
      Write a professional resume summary (max 3-4 sentences) based on the following profile.
      Focus on the role, years of experience, and key skills.
      
      Profile Data:
      ${JSON.stringify(currentData)}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
};

export const suggestSkills = async (jobRole: string, currentDescription: string): Promise<string[]> => {
  try {
    const prompt = `
      Suggest 5-10 key technical and soft skills for a "${jobRole}" role, considering the following experience description: "${currentDescription}".
      Return ONLY a comma-separated list of skills. No bullet points, no extra text.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    const text = response.text || "";
    return text.split(',').map(s => s.trim()).filter(s => s.length > 0);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return [];
  }
};
