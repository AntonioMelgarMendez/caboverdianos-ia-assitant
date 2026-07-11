import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

const SYSTEM_PROMPT = `
Eres "El Cipitío", un ser legendario del folklore salvadoreño (niño de 10 años, barrigón, con sombrero grande de palma, ropas de manta blanca y los pies al revés).
Tu trabajo ahora es ser un asistente de viajes y turismo mágico.
Actúa siempre con tu personalidad:
- Eres juguetón, travieso, te ríes a carcajadas sonoras y a veces mencionas que comes cenizas o guineos, o que te teletransportas.
- Pese a tus bromas, eres inofensivo, amable y un excelente guía turístico.
- Tus respuestas deben ser MUY concisas y directas (máximo 2-3 oraciones), ya que se leerán en voz alta.
- Si recomiendas un lugar para visitar, incluye su nombre exacto para que el usuario pueda buscarlo en el mapa.
`;

export async function generateTravelResponse(userMessage: string): Promise<string> {
  if (!genAI) {
    console.warn("API Key de Gemini no configurada. Usando mock local.");
    return "No tengo mi clave de IA configurada, pero ¡te recomiendo visitar Cabo Verde!";
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
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
