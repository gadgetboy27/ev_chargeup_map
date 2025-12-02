import { GoogleGenAI, Type } from "@google/genai";
import { ChatMessage } from "../types";

// Safety check for API key
const apiKey = process.env.API_KEY || '';
if (!apiKey) {
  console.warn("API_KEY is missing. Gemini features will not work.");
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Uses Gemini with Google Maps grounding to find information.
 */
export const searchChargers = async (query: string, userLat?: number, userLng?: number): Promise<ChatMessage> => {
  try {
    const modelId = "gemini-2.5-flash"; // Good balance for search
    
    // Construct tool config with location if available
    const toolConfig: any = {};
    if (userLat && userLng) {
      toolConfig.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: userLat,
            longitude: userLng
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Find EV chargers: ${query}. Focus on location, power, and operator.`,
      config: {
        tools: [{ googleMaps: {} }],
        ...toolConfig
      }
    });

    const text = response.text || "I found some results.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const urls: Array<{uri: string, title: string}> = [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.web?.uri && chunk.web?.title) {
        urls.push({ uri: chunk.web.uri, title: chunk.web.title });
      }
      // Maps grounding chunk structure might vary, checking generic access
      // Note: The specific structure for maps chunks in the new SDK isn't always documented as 'web',
      // but often the text response contains the links or they are in the grounding metadata source.
      // We will rely on extracting standard fields if present.
    });

    return {
      id: Date.now().toString(),
      role: 'model',
      text,
      groundingUrls: urls
    };

  } catch (error) {
    console.error("Gemini Search Error:", error);
    return {
      id: Date.now().toString(),
      role: 'model',
      text: "Sorry, I couldn't connect to the charging network database right now. Please try again."
    };
  }
};

/**
 * Simulates a handshake with the charging infrastructure via Gemini.
 * We ask Gemini to act as the OCPI (Open Charge Point Interface) gateway.
 */
export const startRemoteSession = async (chargerId: string, vehicleId: string) => {
  try {
    const modelId = "gemini-2.5-flash";
    
    const prompt = `
      Act as an OCPI (Open Charge Point Interface) v2.2 gateway.
      Attempt to start a charging session for Charger ID: ${chargerId} and Vehicle: ${vehicleId}.
      
      Return a JSON object with:
      - status: "ACCEPTED" or "REJECTED"
      - sessionId: string (a mock UUID)
      - message: string (technical response from the charger)
      - estimatedMaxPower: number (kW)
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ["ACCEPTED", "REJECTED"] },
            sessionId: { type: Type.STRING },
            message: { type: Type.STRING },
            estimatedMaxPower: { type: Type.NUMBER }
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Remote Session Start Error:", error);
    // Fallback mock response if API fails
    return {
      status: "ACCEPTED",
      sessionId: `mock_${Date.now()}`,
      message: "Connection established (Fallback Mode)",
      estimatedMaxPower: 50
    };
  }
};