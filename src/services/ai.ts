import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
let genAI: GoogleGenerativeAI | null = null;

if (apiKey) {
  genAI = new GoogleGenerativeAI(apiKey);
}

const SYSTEM_PROMPT = `
Eres un asistente de viajes y turismo mágico para El Salvador (y el mundo). Tu nombre es "El Cipitío", un personaje del folklore salvadoreño, pero tu objetivo PRINCIPAL es ser ÚTIL.
Actúa con este balance:
1. IDENTIDAD (10%): Usa un tono amigable, alguna palabra coloquial salvadoreña ("chero", "púchica", "cipote") de forma natural, y ocasionalmente ríete ("¡Jajaja!").
2. UTILIDAD (90%): Provee información real y valiosa. Cuando recomiendes un lugar, incluye detalles como precios aproximados, clima, seguridad, qué comer ahí o mejor hora para visitar.
3. FORMATO: Tus respuestas de texto deben ser conversacionales pero directas, ideales para ser leídas en voz alta.

REGLA CRÍTICA DE FORMATO:
DEBES responder EXCLUSIVAMENTE con un objeto JSON válido. No incluyas Markdown (\`\`\`json) ni texto fuera del JSON.
La estructura del JSON debe ser exactamente esta:
{
  "text": "Tu respuesta hablada aquí, con tu personalidad",
  "suggestedLocation": {
    "name": "Nombre del lugar que recomiendas (si aplica)",
    "lat": 13.6929,
    "lng": -89.2182
  }
}
Si no estás recomendando un lugar específico en tu respuesta, pon "suggestedLocation": null.
`;

export interface AIResponse {
  text: string;
  suggestedLocation?: {
    name: string;
    lat: number;
    lng: number;
  } | null;
}

export type ChatMessage = {
  text: string;
  sender: 'user' | 'ai';
};

export async function generateTravelResponse(history: ChatMessage[]): Promise<AIResponse> {
  if (!genAI) {
    console.warn("API Key de Gemini no configurada. Usando mock local.");
    return {
      text: "No tengo mi magia de IA activada, pero ¡te recomiendo visitar el Volcán de San Salvador! Jajaja.",
      suggestedLocation: { name: "Volcán de San Salvador", lat: 13.7333, lng: -89.2833 }
    };
  }

  try {

    
    // Construir el historial para Gemini
    const contents = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    // Inyectamos el system prompt en el primer mensaje de usuario o como instrucción del sistema si está soportado.
    // Para simplificar y asegurar compatibilidad con versiones simples de la API, lo ponemos como un mensaje inicial "user".
    // Pero si usamos model.generateContent, podemos pasar systemInstruction en la config del modelo.
    // Lo más seguro es usar systemInstruction en getGenerativeModel:
    
    const configuredModel = genAI.getGenerativeModel({ 
      model: "gemini-3.5-flash",
      systemInstruction: SYSTEM_PROMPT
    });

    const result = await configuredModel.generateContent({ contents });
    const responseText = await result.response.text();
    
    // Limpiar posible Markdown
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanJson) as AIResponse;
  } catch (error) {
    console.error("Error al generar respuesta:", error);
    return {
      text: "Lo siento, me trabé con una ceniza y no pude responder.",
      suggestedLocation: null
    };
  }
}
