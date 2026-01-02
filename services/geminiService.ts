
import { GoogleGenAI, Type } from "@google/genai";
import { FlightSession, Substance, PhysicalEnvironment } from "../types";

// Always use a fresh instance right before making an API call to ensure it uses the most up-to-date API key.

export const getForecastAnalytics = async (
  history: FlightSession[],
  currentPlan: { substance: Substance; dosage: number; physical: PhysicalEnvironment }
) => {
  if (!process.env.API_KEY) return { anxietyProbability: 0.1, wellBeingScore: 8, warning: null };

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Analyze this user's psychedelic session history (JSON):
    ${JSON.stringify(history)}
    
    Predict the outcomes for a future session with:
    Substance: ${currentPlan.substance}
    Dosage: ${currentPlan.dosage}
    Environment: ${currentPlan.physical}
    
    Return a JSON response evaluating the Anxiety Probability (0-1) and Well-Being Score (1-10).
    Include a prevention warning if the environment is "New Environment" and the dose is relatively high compared to history.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            anxietyProbability: { type: Type.NUMBER },
            wellBeingScore: { type: Type.NUMBER },
            warning: { type: Type.STRING, nullable: true }
          },
          required: ["anxietyProbability", "wellBeingScore"]
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Forecast Error:", error);
    return { anxietyProbability: 0.2, wellBeingScore: 7, warning: "Prediction engine temporarily unavailable." };
  }
};

export const getAIInsights = async (history: FlightSession[]) => {
  if (!process.env.API_KEY || history.length < 1) {
    return "Insufficient data for meaningful insights. Complete more flights to unlock pattern recognition.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `
    Review the following psychonautical flight history and identify 3 critical correlations or insights.
    Focus on variables like Dosage, Social Setting (Alone vs Not Alone), Physical Setting (Familiar vs New), 
    and Mood/Attention outcomes.
    
    History: ${JSON.stringify(history)}
    
    Provide a professional, clinical, yet supportive analysis in a single short paragraph. 
    Use the persona of a world-class integration specialist. 
    Keep it concise.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 32768 } // Updated to max budget for complex reasoning
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Insights Error:", error);
    return "Pattern analysis engine is currently recalibrating. Please check back later.";
  }
};
