import type { EventProvider, AppEvent } from './EventProvider';

export class MockDataTeamProvider implements EventProvider {
  async getEvents(): Promise<AppEvent[]> {
    // Simula latencia de red
    await new Promise(resolve => setTimeout(resolve, 800));

    return [
      {
        id: '1',
        title: 'Festival de la Piña',
        description: 'El festival más colorido de la Sierra Tecapa. Concursos de la piña más grande, degustación de vinos artesanales de piña, música de marimba en vivo y un desfile comunitario por las calles empedradas de Santa María Ostuma.',
        lat: 13.6261,
        lng: -88.9419,
        date: '2026-08-15',
        startTime: '9:00 AM',
        endTime: '5:00 PM',
        imageUrl: 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=400&h=250&fit=crop',
        media: [
          { type: 'image', url: 'https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=800&h=600&fit=crop' },
          { type: 'image', url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=800&h=600&fit=crop' },
          { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
        ],
        itinerary: [
          '9:00 AM — Apertura y bendición de cosechas',
          '10:00 AM — Concurso de la piña más grande',
          '12:00 PM — Almuerzo típico (pupusas, yuca frita)',
          '2:00 PM — Presentación de marimba',
          '4:00 PM — Premiación y cierre'
        ],
        activities: ['Degustación de vinos de piña', 'Concurso de piñas', 'Música en vivo', 'Artesanías locales', 'Comida típica'],
        price: null,
        currency: 'USD',
        category: 'gastronomía',
        ageRange: 'Todas las edades'
      },
      {
        id: '2',
        title: 'Torneo Internacional de Surf',
        description: 'Playa El Tunco recibe a surfistas de más de 15 países para competir en las olas de clase mundial de la costa del Pacífico salvadoreño. Incluye clases gratuitas para principiantes, DJ sets al atardecer y food trucks gourmet.',
        lat: 13.4936,
        lng: -89.3828,
        date: '2026-09-20',
        startTime: '6:30 AM',
        endTime: '6:00 PM',
        imageUrl: 'https://images.unsplash.com/photo-1502680390548-bdbac40a5781?w=400&h=250&fit=crop',
        itinerary: [
          '6:30 AM — Check-in de competidores',
          '7:00 AM — Rondas clasificatorias',
          '10:00 AM — Clases gratuitas para principiantes',
          '12:00 PM — Pausa y food trucks',
          '1:00 PM — Semifinales',
          '4:00 PM — Final y premiación',
          '5:00 PM — DJ set en la playa'
        ],
        activities: ['Competencia profesional', 'Clases de surf gratis', 'Food trucks', 'DJ set al atardecer', 'Yoga en la playa'],
        price: 5,
        currency: 'USD',
        category: 'deportes',
        ageRange: '12+'
      },
      {
        id: '3',
        title: 'Noche de los Farolitos',
        description: 'Una de las tradiciones más hermosas de El Salvador. El pueblo entero de Concepción de Ataco se ilumina con miles de farolitos de papel mientras los vecinos salen a las calles con comida, música y alegría. Patrimonio cultural inmaterial.',
        lat: 13.8711,
        lng: -89.8483,
        date: '2026-09-07',
        startTime: '6:00 PM',
        endTime: '11:00 PM',
        imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=400&h=250&fit=crop',
        itinerary: [
          '6:00 PM — Encendido ceremonial de los farolitos',
          '7:00 PM — Recorrido por las calles iluminadas',
          '8:00 PM — Presentación de danzas folclóricas',
          '9:00 PM — Concierto de música tradicional',
          '10:30 PM — Quema de pólvora y cierre'
        ],
        activities: ['Recorrido de farolitos', 'Danzas folclóricas', 'Gastronomía nocturna', 'Artesanías', 'Fotografía nocturna'],
        price: null,
        currency: 'USD',
        category: 'cultura',
        ageRange: 'Todas las edades'
      },
      {
        id: '4',
        title: 'Ruta de las Flores en Bicicleta',
        description: 'Tour guiado en bicicleta por los pueblos más pintorescos de la Ruta de las Flores: Juayúa, Apaneca y Ataco. Incluye paradas en miradores, cafetales y degustación de café de especialidad.',
        lat: 13.8436,
        lng: -89.7567,
        date: '2026-08-03',
        startTime: '7:00 AM',
        endTime: '2:00 PM',
        imageUrl: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=400&h=250&fit=crop',
        itinerary: [
          '7:00 AM — Punto de encuentro en Juayúa',
          '7:30 AM — Salida hacia Apaneca',
          '9:00 AM — Parada en mirador y café',
          '10:30 AM — Descenso hacia Ataco',
          '12:00 PM — Almuerzo en restaurante local',
          '1:30 PM — Recorrido por murales de Ataco'
        ],
        activities: ['Ciclismo de montaña', 'Degustación de café', 'Fotografía de paisajes', 'Gastronomía local'],
        price: 25,
        currency: 'USD',
        category: 'aventura',
        ageRange: '16+'
      },
      {
        id: '5',
        title: 'Senderismo Volcán de Santa Ana',
        description: 'Ascenso al punto más alto de El Salvador con guías certificados. El volcán Ilamatepec (2381m) ofrece vistas del lago de Coatepeque y su increíble cráter con laguna turquesa. Dificultad moderada.',
        lat: 13.8533,
        lng: -89.6300,
        date: '2026-08-10',
        startTime: '5:30 AM',
        endTime: '1:00 PM',
        imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=250&fit=crop',
        itinerary: [
          '5:30 AM — Registro en Cerro Verde',
          '6:00 AM — Inicio del ascenso con guía',
          '8:30 AM — Llegada al cráter',
          '9:00 AM — Tiempo libre para fotos',
          '10:00 AM — Descenso',
          '12:00 PM — Almuerzo en Cerro Verde'
        ],
        activities: ['Senderismo de montaña', 'Fotografía de cráter', 'Observación de aves', 'Almuerzo campestre'],
        price: 3,
        currency: 'USD',
        category: 'naturaleza',
        ageRange: '12+'
      }
    ];
  }
}
