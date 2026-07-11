export interface AppEvent {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  date: string;
  startTime?: string;
  endTime?: string;
  imageUrl?: string;
  itinerary?: string[];
  activities?: string[];
  price?: number | null;  // null = gratis
  currency?: string;
  category?: 'cultura' | 'aventura' | 'gastronomía' | 'naturaleza' | 'deportes' | 'religioso';
  ageRange?: string;  // ej. "Todas las edades", "18+"
}

export interface EventProvider {
  /**
   * Obtiene la lista de eventos.
   */
  getEvents(): Promise<AppEvent[]>;
}
