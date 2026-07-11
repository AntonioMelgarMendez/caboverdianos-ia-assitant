import { EventProvider, AppEvent } from './EventProvider';

export class MockDataTeamProvider implements EventProvider {
  async getEvents(): Promise<AppEvent[]> {
    // Simula latencia de red
    await new Promise(resolve => setTimeout(resolve, 800));

    // Datos simulados del "otro equipo de datos"
    return [
      {
        id: 'evt-1',
        title: 'Festival de la Molienda',
        description: 'Música, dulces tradicionales y molienda de caña.',
        lat: 13.6443, // San Vicente aprox
        lng: -88.7844,
        date: '2026-08-15'
      },
      {
        id: 'evt-2',
        title: 'Fiestas Agostinas',
        description: 'Celebración tradicional con desfiles y comida típica.',
        lat: 13.6929, // San Salvador
        lng: -89.2182,
        date: '2026-08-01'
      }
    ];
  }
}
