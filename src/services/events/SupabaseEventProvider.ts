import type { EventProvider, AppEvent } from './EventProvider';
import { supabase } from '../supabase';

export class SupabaseEventProvider implements EventProvider {
  async getEvents(): Promise<AppEvent[]> {
    const { data: places, error } = await supabase
      .from('places')
      .select('*');

    if (error) {
      console.error('Error fetching places from Supabase:', error);
      return [];
    }

    if (!places) return [];

    return places.map((place) => {
      // 1. Construir el arreglo de media con las imágenes de Google
      const media = [];
      
      // Si hay imágenes guardadas, las convertimos en URLs (usando la API key del frontend)
      if (place.images && Array.isArray(place.images) && place.images.length > 0) {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        place.images.forEach((photoName: string) => {
          media.push({
            type: 'image',
            url: `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=800&maxWidthPx=800&key=${apiKey}`
          });
        });
      }

      // 2. Agregar el Street View al final
      media.push({ type: 'streetview', lat: place.lat, lng: place.lng });

      return {
        id: place.id,
        title: place.name,
        description: place.description || '',
        lat: place.lat,
        lng: place.lng,
        category: place.category as any || 'general',
        media,
        date: new Date().toISOString().split('T')[0],
        price: null,
        currency: 'USD',
        // Podemos pasar las reviews y rating si decidimos extender AppEvent después,
        // por ahora las omitimos o las mapeamos si es necesario
      };
    });
  }
}
