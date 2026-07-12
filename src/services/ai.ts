import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

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
3. PRECISIÓN GEOGRÁFICA: Siempre que el usuario pregunte por un lugar o recomendación, debes incluir el nombre del lugar exacto y sus coordenadas precisas (latitud y longitud) en el objeto de ubicación. Si no recomiendas un lugar específico o la pregunta no tiene relación con ubicación, la ubicación debe ser nula.
4. FORMATO: Tus respuestas de texto deben ser conversacionales pero directas, ideales para ser leídas en voz alta.
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

    const configuredModel = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash", // Utilizando un modelo robusto que soporta Structured Outputs
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            text: {
              type: SchemaType.STRING,
              description: "Tu respuesta hablada aquí, con tu personalidad."
            },
            suggestedLocation: {
              type: SchemaType.OBJECT,
              description: "La ubicación sugerida en la respuesta. Nulo si no aplica a la pregunta.",
              nullable: true,
              properties: {
                name: {
                  type: SchemaType.STRING,
                  description: "Nombre corto e identificable del lugar."
                },
                lat: {
                  type: SchemaType.NUMBER,
                  description: "Coordenada de Latitud precisa."
                },
                lng: {
                  type: SchemaType.NUMBER,
                  description: "Coordenada de Longitud precisa."
                }
              },
              required: ["name", "lat", "lng"]
            }
          },
          required: ["text"]
        }
      }
    });

    const result = await configuredModel.generateContent({ contents });
    const responseText = result.response.text();
    
    return JSON.parse(responseText) as AIResponse;
  } catch (error) {
    console.error("Error al generar respuesta estructurada:", error);
    return {
      text: "Lo siento, tuve un percance mágico y no pude orientarme.",
      suggestedLocation: null
    };
  }
}

