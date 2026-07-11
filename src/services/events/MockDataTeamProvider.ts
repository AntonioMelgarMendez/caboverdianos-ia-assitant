import type { EventProvider, AppEvent } from './EventProvider';

export class MockDataTeamProvider implements EventProvider {
  async getEvents(): Promise<AppEvent[]> {
    // Simula latencia de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // Datos simulados del "otro equipo de datos"
    return [
      {
        id: '1',
        title: 'Festival de la Piña',
        description: 'Música en vivo y gastronomía en Santa María Ostuma.',
        lat: 13.6261,
        lng: -88.9419,
        date: '2023-11-15',
        hours: '9:00 AM - 5:00 PM'
      },
      {
        id: '2',
        title: 'Torneo de Surf',
        description: 'Competencia internacional en la Playa El Tunco.',
        lat: 13.4936,
        lng: -89.3828,
        date: '2023-11-20',
        hours: '7:00 AM - 1:00 PM'
      },
      {
        id: '3',
        title: 'Noche de Farolitos',
        description: 'Tradición cultural en Concepción de Ataco.',
        lat: 13.8711,
        lng: -89.8483,
        date: '2023-09-07',
        hours: '6:00 PM - 11:00 PM'
      }
    ];
  }
}
