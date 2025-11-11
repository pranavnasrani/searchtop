import { GoogleGenAI, Type } from "@google/genai";
import { Weights, GroundingChunk } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const weightsSchema = {
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
    min_price: {
        type: Type.INTEGER,
        description: "The minimum price of the user's budget, if specified. Omit if not mentioned."
    },
    max_price: {
        type: Type.INTEGER,
        description: "The maximum price of the user's budget, if specified. Omit if not mentioned."
    }
  },
  required: ["performance", "battery", "build_quality", "display", "audio", "portability"]
};


export const getWeightsFromQuery = async (query: string): Promise<{ weights: Weights; priceRange?: { min_price?: number; max_price?: number } }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the user's laptop preference and return a JSON object with weights from 0 to 10 for each category. Also extract the minimum and maximum price if the user specifies a budget (e.g., 'under $1000', 'around $1500', 'between $800 and $1200'). The user says: "${query}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: weightsSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    const weights: Weights = {
        performance: result.performance,
        battery: result.battery,
        build_quality: result.build_quality,
        display: result.display,
        audio: result.audio,
        portability: result.portability,
    };
    
    const requiredKeys: (keyof Weights)[] = ["performance", "battery", "build_quality", "display", "audio", "portability"];
    for (const key of requiredKeys) {
      if (typeof weights[key] !== 'number' || weights[key] < 0 || weights[key] > 10) {
        console.warn(`Invalid or missing weight for ${key}`);
        weights[key] = 5; // fallback for a single key
      }
    }

    const priceRange = (result.min_price || result.max_price) 
        ? { min_price: result.min_price, max_price: result.max_price }
        : undefined;

    return { weights, priceRange };

  } catch (error) {
    console.error("Error getting weights from Gemini:", error);
    // Fallback to default weights in case of an error
    return { weights: { performance: 5, battery: 5, build_quality: 5, display: 5, audio: 5, portability: 5 } };
  }
};


export const getWebRecommendations = async (
  query: string, 
  priceRange: { min: number, max: number }
): Promise<{ recommendations: string; sources: GroundingChunk[] }> => {
  try {
    const prompt = `Based on the latest online reviews and recommendations, find laptops that fit this description: "${query}". The user's budget is between $${priceRange.min} and $${priceRange.max}. Provide a helpful, concise summary as a knowledgeable expert. Focus on general recommendations, types of laptops, or specific models that are highly regarded for these needs.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const recommendations = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Filter out any non-web sources if they exist
    const webSources = sources.filter((s: any) => s.web) as GroundingChunk[];

    return { recommendations, sources: webSources };

  } catch (error) {
    console.error("Error getting web recommendations from Gemini:", error);
    throw new Error("Failed to get AI recommendations. The model may be unavailable.");
  }
};