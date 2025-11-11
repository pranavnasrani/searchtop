import { GoogleGenAI, Type } from "@google/genai";
import { Weights, GroundingChunk, Laptop, LaptopData } from "../types";

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

const newLaptopSchema = {
    type: Type.OBJECT,
    properties: {
        laptops: {
            type: Type.ARRAY,
            description: "An array of new laptop objects.",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Full name of the laptop model." },
                    brand: { type: Type.STRING, description: "Brand name, e.g., 'Apple', 'Dell'." },
                    price: { type: Type.INTEGER, description: "Estimated price in USD." },
                    release_date: { type: Type.STRING, description: "Release date in YYYY-MM-DD format." },
                    image_urls: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of image URLs. Can be empty." },
                    cpu: { type: Type.STRING, description: "CPU model, e.g., 'Apple M3 Pro'." },
                    gpu: { type: Type.STRING, description: "GPU model, e.g., 'Integrated 14-core GPU'." },
                    ram: { type: Type.STRING, description: "RAM configuration, e.g., '16GB Unified Memory'." },
                    storage: { type: Type.STRING, description: "Storage configuration, e.g., '512GB SSD'." },
                    display: { type: Type.STRING, description: "Display specifications, e.g., '14.2-inch Liquid Retina XDR'." },
                    battery: { type: Type.STRING, description: "Battery life estimation, e.g., 'Up to 18 hours'." },
                    build: { type: Type.STRING, description: "Build materials and dimensions, e.g., 'Aluminum chassis, 1.55 cm thin'." },
                    audio: { type: Type.STRING, description: "Audio system description, e.g., 'High-fidelity six-speaker sound system'." },
                    ports: { type: Type.STRING, description: "List of available ports, e.g., '3x Thunderbolt 4, HDMI, SDXC card slot'." },
                    scores: {
                        type: Type.OBJECT,
                        properties: {
                            performance: { type: Type.INTEGER, description: "Estimated score from 0-10 for performance." },
                            battery: { type: Type.INTEGER, description: "Estimated score from 0-10 for battery life." },
                            build_quality: { type: Type.INTEGER, description: "Estimated score from 0-10 for build quality." },
                            display: { type: Type.INTEGER, description: "Estimated score from 0-10 for display quality." },
                            audio: { type: Type.INTEGER, description: "Estimated score from 0-10 for audio quality." },
                            portability: { type: Type.INTEGER, description: "Estimated score from 0-10 for portability." },
                        },
                        required: ["performance", "battery", "build_quality", "display", "audio", "portability"]
                    }
                },
                required: ["name", "brand", "price", "release_date", "cpu", "gpu", "ram", "storage", "display", "scores"]
            }
        }
    },
    required: ["laptops"]
};


export const findNewLaptops = async (existingLaptopNames: string[]): Promise<LaptopData[]> => {
  try {
    const prompt = `You are a laptop technology expert. Find 3-5 recently released high-profile laptops (from the last 6 months) that are NOT in this list of existing laptops: [${existingLaptopNames.join(', ')}]. For each new laptop you find, provide its detailed specifications and estimate its scores from 0-10 for the given categories. Return the data in the required JSON format. Ensure all fields are filled to the best of your ability. If a specific detail isn't widely available, make a reasonable estimate. If you cannot find any new laptops that fit the criteria, return a JSON object with an empty "laptops" array.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: newLaptopSchema,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    return result.laptops || [];

  } catch (error) {
    console.error("Error finding new laptops from Gemini:", error);
    throw new Error("Failed to find new laptops. The model may be unavailable or returned an invalid response.");
  }
};

export const scrapeNewLaptops = async (existingLaptopNames: string[]): Promise<LaptopData[]> => {
  try {
    const prompt = `Act as a tech research assistant. Use Google Search to find 2-3 of the latest, most popular laptops reviewed on top tech sites like The Verge, CNET, PCMag, or Engadget in the last 3 months. Exclude any laptops from this list: [${existingLaptopNames.join(', ')}]. For each new laptop found, extract its detailed specifications and estimate its scores from 0-10 for the given categories based on the reviews. Return the data in the required JSON format. If no new, highly-reviewed laptops are found, return a JSON object with an empty "laptops" array.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      // FIX: Per Gemini API guidelines, responseMimeType and responseSchema cannot be used with the googleSearch tool.
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    return result.laptops || [];

  } catch (error) {
    console.error("Error scraping for new laptops with Gemini:", error);
    throw new Error("Failed to scrape for new laptops. The AI might have been unable to find or parse information from the web.");
  }
};