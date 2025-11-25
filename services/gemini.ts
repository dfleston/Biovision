import { GoogleGenAI, Type } from "@google/genai";
import { GenerateVisionResponse } from "../types";

const getClient = (apiKey?: string) => {
  const key = apiKey || process.env.API_KEY;
  if (!key) {
    throw new Error("API Key is missing. Please provide one in settings.");
  }
  return new GoogleGenAI({ apiKey: key });
};

/**
 * Generates the scientific descriptions and image prompts for how two animals see each other.
 */
export const getScientificVisionDetails = async (
  animalA: string,
  animalB: string,
  config?: { apiKey?: string; model?: string }
): Promise<GenerateVisionResponse> => {
  const ai = getClient(config?.apiKey);
  const model = config?.model || "gemini-2.5-flash";
  
  const systemInstruction = `
    You are an expert in comparative ophthalmology, biology, and animal sensory systems.
    Your task is to analyze the visual systems of two selected animals and describe how they would visually perceive each other.
    
    Consider these factors:
    1. Color Vision (Trichromatic, Dichromatic, Monochromatic, UV sensitivity, etc.)
    2. Visual Acuity (Blurriness, sharpness, resolution)
    3. Field of View & Depth Perception (Binocular overlap, panoramic vision)
    4. Motion Sensitivity (Flicker fusion rate)
    5. Special Features (Thermal sensing, night vision/tapetum lucidum, compound eyes/mosaic vision)
    
    You must also generate a highly specific image generation prompt that can be used by an AI image generator to simulate this POV photorealistically.
    The prompt should include camera effects to mimic the biology (e.g., "apply gaussian blur", "shift hue to blue and yellow only", "fisheye lens distortion", "pixelated mosaic effect").
    
    The setting is a neutral natural environment.
  `;

  const prompt = `
    Animal A: ${animalA}
    Animal B: ${animalB}
    
    Describe:
    1. How Animal A sees Animal B.
    2. How Animal B sees Animal A.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          perspectiveA: {
            type: Type.OBJECT,
            description: `How ${animalA} sees ${animalB}`,
            properties: {
              scientificDescription: { type: Type.STRING, description: "A paragraph explaining the scientific basis of the visual perception." },
              visualFeatures: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "Key bullet points, e.g., 'Dichromatic Vision', 'Low Acuity'"
              },
              imagePrompt: { 
                type: Type.STRING, 
                description: "A detailed prompt for an image generator to simulate this specific view. Start with 'POV shot of...'" 
              },
            },
            required: ["scientificDescription", "visualFeatures", "imagePrompt"]
          },
          perspectiveB: {
            type: Type.OBJECT,
            description: `How ${animalB} sees ${animalA}`,
            properties: {
              scientificDescription: { type: Type.STRING },
              visualFeatures: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }
              },
              imagePrompt: { type: Type.STRING },
            },
            required: ["scientificDescription", "visualFeatures", "imagePrompt"]
          }
        },
        required: ["perspectiveA", "perspectiveB"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");
  
  return JSON.parse(text) as GenerateVisionResponse;
};

/**
 * Generates an image based on the scientific prompt using Gemini Image generation.
 */
export const generatePOVImage = async (
  prompt: string,
  config?: { apiKey?: string; model?: string }
): Promise<string> => {
  const ai = getClient(config?.apiKey);
  const model = config?.model || "gemini-2.5-flash-image"; 
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        // No strict schema or mime type for image model content generation
      }
    });

    // Iterate parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};