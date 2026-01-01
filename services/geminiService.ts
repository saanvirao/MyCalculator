
import { GoogleGenAI, Type } from "@google/genai";
import { AIExplanation } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getMathExplanation = async (expression: string, result: string): Promise<AIExplanation> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Explain the calculation: ${expression} = ${result}. 
                 Break it down into simple steps and provide one or two helpful math tips related to this operations.
                 Provide the response in a structured JSON format.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            explanation: { type: Type.STRING, description: "A high-level summary of the calculation." },
            steps: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Step-by-step breakdown of how the result was achieved."
            },
            tips: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Related mathematical tips or shortcuts."
            }
          },
          required: ["explanation", "steps", "tips"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to fetch AI explanation");
  }
};

export const solveWordProblem = async (problem: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Solve this math word problem and provide the numeric result as the very first line, followed by a short explanation: ${problem}`,
      config: {
        systemInstruction: "You are a helpful math assistant. Focus on accuracy and clarity."
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I couldn't solve that problem.";
  }
};
