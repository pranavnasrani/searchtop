import { GoogleGenAI, Type } from "@google/genai";
import { Weights } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const schema = {
  type: Type.OBJECT,
  properties: {
    performance: {
      type: Type.INTEGER,
      description: "Score from 0-10 for performance needs (CPU, GPU, RAM). High for gaming, video editing. Low for browsing, documents.",
    },
    battery: {
      type: Type.INTEGER,
      description: "Score from 0-10 for battery life importance. High for travel, mobile use. Low for desktop replacement.",
    },
    build_quality: {
      type: Type.INTEGER,
      description: "Score from 0-10 for build quality importance (materials, durability). High for travel, longevity. Low for stationary use.",
    },
    display: {
      type: Type.INTEGER,
      description: "Score from 0-10 for display quality importance (resolution, color accuracy, brightness). High for creative work, media. Low for coding, writing.",
    },
    audio: {
      type: Type.INTEGER,
      description: "Score from 0-10 for audio quality importance (speakers). High for media consumption without headphones. Low otherwise.",
    },
    portability: {
      type: Type.INTEGER,
      description: "Score from 0-10 for portability importance (weight, size). High for frequent commuters, students. Low for home/office use.",
    },
  },
  required: ["performance", "battery", "build_quality", "display", "audio", "portability"]
};


export const getWeightsFromQuery = async (query: string): Promise<Weights> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the user's laptop preference and return a JSON object with weights from 0 to 10 for each category. The user says: "${query}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    const weights = JSON.parse(jsonText);

    // Basic validation to ensure the result matches the Weights type
    const requiredKeys: (keyof Weights)[] = ["performance", "battery", "build_quality", "display", "audio", "portability"];
    for (const key of requiredKeys) {
      if (typeof weights[key] !== 'number' || weights[key] < 0 || weights[key] > 10) {
        throw new Error(`Invalid or missing weight for ${key}`);
      }
    }

    return weights as Weights;

  } catch (error) {
    console.error("Error getting weights from Gemini:", error);
    // Fallback to default weights in case of an error
    return { performance: 5, battery: 5, build_quality: 5, display: 5, audio: 5, portability: 5 };
  }
};
