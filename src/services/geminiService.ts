import { GoogleGenAI } from "@google/genai";
import { FieldPolygon, Equipment } from "../types";

export const analyzeFieldWithGemini = async (
  field: FieldPolygon,
  equipment: Equipment
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Role: Agricultural Consultant.
    Task: Analyze the following field data and provide 3 short, actionable efficiency tips for the farmer using this specific equipment.
    
    Data:
    - Field Area: ${field.areaSqMeters.toFixed(0)} square meters
    - Perimeter: ${field.perimeterMeters.toFixed(0)} meters
    - Shape Compactness: ${(field.areaSqMeters / (field.perimeterMeters * field.perimeterMeters)).toFixed(4)} (Low = irregular/long, High = compact/circle)
    - Equipment: ${equipment.name} (${equipment.type})
    - Equipment Width: ${equipment.width} meters
    
    Format output as a simple list. Do not use markdown bolding. Keep it very concise (under 50 words per tip).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Could not generate insights at this time. Please check network connection.";
  }
};