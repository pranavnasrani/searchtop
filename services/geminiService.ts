

import { GoogleGenAI, Type } from "@google/genai";
import { Weights } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// FIX: Renamed 'build' to 'build_quality' to match the updated Weights interface.
const schema = {
  type: Type.OBJECT,
  properties: {
    performance: { type: Type.NUMBER, description: 'Weight for processing power (CPU, GPU, RAM).' },
    battery: { type: Type.NUMBER, description: 'Weight for battery life and longevity.' },
    build_quality: { type: Type.NUMBER, description: 'Weight for build quality, materials, and durability.' },
    display: { type: Type.NUMBER, description: 'Weight for screen quality, resolution, and color accuracy.' },
    audio: { type: Type.NUMBER, description: 'Weight for speaker and microphone quality.' },
    portability: { type: Type.NUMBER, description: 'Weight for lightness and compactness.' },
    price: { type: Type.NUMBER, description: 'Weight for affordability (lower price is better).' },
  },
  required: ['performance', 'battery', 'build_quality', 'display', 'audio', 'portability', 'price'],
};

export const getPreferenceWeights = async (preferenceText: string): Promise<Weights> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      // FIX: Updated prompt to ask for 'build_quality' weight.
      contents: `Analyze the following user preference for a laptop and assign a weight from 0 to 10 for each of these categories: performance, battery, build_quality, display, audio, portability, price. A higher weight means more importance. Return the result as a JSON object that adheres to the provided schema. User preference: "${preferenceText}"`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      },
    });

    const jsonString = response.text.trim();
    const parsedJson = JSON.parse(jsonString);
    
    // FIX: The original validation was not robust and could allow non-numeric properties
    // to be passed through, causing type errors in App.tsx.
    // This new implementation creates a clean `Weights` object, ensuring type safety.
    // FIX: Updated default weights to use 'build_quality'.
    const validatedWeights: Weights = {
      performance: 5,
      battery: 5,
      build_quality: 5,
      display: 5,
      audio: 5,
      portability: 5,
      price: 5,
    };

    for (const key of Object.keys(validatedWeights) as Array<keyof Weights>) {
      const value = parsedJson?.[key];
      if (typeof value === 'number' && value >= 0 && value <= 10) {
        validatedWeights[key] = value;
      } else if (parsedJson && Object.prototype.hasOwnProperty.call(parsedJson, key)) {
        console.warn(`Invalid or out-of-range weight for ${key}: ${value}. Using default.`);
      }
    }

    return validatedWeights;
  } catch (error) {
    console.error("Error getting preference weights from Gemini API:", error);
    // Return a default set of weights on error
    // FIX: Updated fallback weights to use 'build_quality'.
    return {
      performance: 5, battery: 5, build_quality: 5, display: 5,
      audio: 5, portability: 5, price: 5,
    };
  }
};