import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedBillData } from "../types.ts";

// Define the schema as a plain object to avoid potential SDK version mismatches
const billSchema: any = {
  type: Type.OBJECT,
  properties: {
    documentType: { type: Type.STRING, description: "Type of document (e.g., Invoice, Lorry Receipt, E-Way Bill)" },
    documentNumber: { type: Type.STRING, description: "The primary reference number (Invoice No, LR No)" },
    date: { type: Type.STRING, description: "Date of the document" },
    sender: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        address: { type: Type.STRING },
        taxId: { type: Type.STRING, description: "GSTIN or PAN" }
      }
    },
    receiver: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING },
        address: { type: Type.STRING },
        taxId: { type: Type.STRING }
      }
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          quantity: { type: Type.STRING },
          rate: { type: Type.STRING },
          amount: { type: Type.STRING }
        }
      }
    },
    subtotal: { type: Type.STRING },
    taxAmount: { type: Type.STRING },
    totalAmount: { type: Type.STRING },
    currency: { type: Type.STRING, description: "Currency symbol or code (e.g., ₹, INR)" },
    notes: { type: Type.STRING, description: "Any extra remarks or payment terms" }
  },
  required: ["documentType", "totalAmount", "items"]
};

export const scanDocument = async (base64Data: string, mimeType: string): Promise<ExtractedBillData> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment variables.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data
            }
          },
          {
            text: `Analyze this document and extract its data into structured JSON matching the provided schema.`
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: billSchema,
        temperature: 0.1
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No data returned from Gemini.");
    }

    return JSON.parse(text) as ExtractedBillData;

  } catch (error) {
    console.error("Gemini Scan Error:", error);
    throw error;
  }
};