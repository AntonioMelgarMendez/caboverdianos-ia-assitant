export interface AppEvent {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  date: string;
}

export interface EventProvider {
  /**
   * Obtiene la lista de eventos.
   */
  getEvents(): Promise<AppEvent[]>;
}
