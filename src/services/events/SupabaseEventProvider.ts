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

    return places.map((place) => ({
      id: place.id,
      title: place.name,
      description: place.description || '',
      lat: place.lat,
      lng: place.lng,
      // Usaremos campos extra que añadimos si existen
      category: place.category as any || 'general',
      // Si no tenemos imagen por defecto y queremos usar streetview como media principal
      media: [
        { type: 'streetview', lat: place.lat, lng: place.lng }
      ],
      // Fecha por defecto para compatibilidad
      date: new Date().toISOString().split('T')[0],
      price: null, // Asumimos que los lugares son gratuitos por ahora
      currency: 'USD'
    }));
  }
}
