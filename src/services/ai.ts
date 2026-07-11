import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

const SYSTEM_PROMPT = `
Eres un asistente de viajes inteligente e interactivo.
Tus respuestas deben ser:
1. Concisas y directas (no más de 2-3 oraciones breves), ya que se leerán en voz alta.
2. Amigables, entusiastas y útiles.
3. Si recomiendes un lugar, incluye su nombre exacto.
`;

export async function generateTravelResponse(userMessage: string): Promise<string> {
  if (!genAI) {
    console.warn("API Key de Gemini no configurada. Usando mock local.");
    return "No tengo mi clave de IA configurada, pero ¡te recomiendo visitar Cabo Verde!";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `Usuario: ${userMessage}` }
    ]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Error al generar respuesta:", error);
    return "Lo siento, tuve un problema procesando tu solicitud con Gemini.";
  }
}
