import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (apiKey) {
  openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Solo para el MVP (lo ideal es usar Supabase Edge Functions)
  });
}

const SYSTEM_PROMPT = `
Eres un asistente de viajes inteligente e interactivo.
Tus respuestas deben ser:
1. Concisas y directas (no más de 2-3 oraciones breves), ya que se leerán en voz alta.
2. Amigables, entusiastas y útiles.
3. Si recomiendes un lugar, incluye su nombre exacto para poder buscarlo en el mapa.
`;

export async function generateTravelResponse(userMessage: string): Promise<string> {
  if (!openai) {
    console.warn("API Key de OpenAI no configurada. Usando mock local.");
    return "No tengo mi clave de IA configurada, pero ¡te recomiendo visitar París!";
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // o gpt-4o-mini
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });
    
    return response.choices[0].message.content || "Lo siento, no pude formular una respuesta.";
  } catch (error) {
    console.error("Error al generar respuesta:", error);
    return "Lo siento, tuve un problema procesando tu solicitud.";
  }
}
