# CipiTourist — Asistente de Viajes con IA

Aplicación web de turismo inteligente para El Salvador. Combina un mapa interactivo, un asistente conversacional con IA (personificado como **"El Cipitío"**, del folklore salvadoreño) y un sistema de gamificación para animar a los usuarios a descubrir y visitar lugares y eventos reales del país.

## Descripción breve

El usuario chatea por texto (o escucha por voz) con el Cipitío, quien recomienda lugares con nombre y coordenadas exactas. Esa recomendación se muestra al instante en un mapa interactivo, donde también se pueden explorar eventos y sitios turísticos reales (cargados desde Supabase), trazar la ruta real por carretera hacia ellos, ver el lugar en Google Street View, guardarlos en una agenda personal y ganar puntos que luego se canjean por cupones de descuento.

## Tecnologías utilizadas

**Frontend**
- React 19 + TypeScript
- Vite 8 (build tool)
- Tailwind CSS v4
- React Router v7
- lucide-react (iconos)
- qrcode.react (generación de códigos QR para cupones)

**3D / Multimedia**
- Three.js, `@react-three/fiber`, `@react-three/drei` — renderizado y animación del modelo 3D del Cipitío (`.glb`)
- Web Speech API + ElevenLabs API — texto a voz (TTS)

**Mapas y geolocalización**
- Leaflet + `react-leaflet` (mapa base, tiles oscuros de CARTO/OpenStreetMap)
- OSRM (Open Source Routing Machine) — trazado de rutas reales por carretera
- Google Maps JavaScript API — Street View 360°
- Geolocalización del navegador (`navigator.geolocation`) — check-in automático por proximidad

**Backend como servicio**
- Supabase — autenticación (OAuth de Google) y base de datos Postgres

**Inteligencia Artificial**
- Google Gemini (`@google/generative-ai`, modelo `gemini-1.5-flash`) — chat conversacional con salida JSON estructurada

**Herramientas de datos (scripts internos)**
- Node.js, `dotenv`
- Playwright + Cheerio — scraping de eventos
- Google Places API (New) — enriquecimiento de datos de lugares

**Calidad de código**
- oxlint (linter)
- TypeScript (`tsc -b`)

## Estructura del proyecto

El código fuente está organizado por carpetas/módulos según su responsabilidad:

```
src/
├── assets/            # Modelo 3D (Cipitio.glb), imágenes
├── components/        # Componentes de UI reutilizables (mapa, modales, chat 3D, etc.)
├── pages/              # Páginas/rutas: Landing.tsx y Home.tsx
└── services/           # Lógica de negocio e integraciones externas
    └── events/          # Abstracción de "proveedor de eventos" (interfaz + implementaciones)

scripts/
├── scraper/            # Scraping de eventos (Playwright/Cheerio)
├── generate_sql_seed.js       # Genera seed_places.sql a partir de scraper de lugares
├── generate_events_sql_seed.js # Genera seed_events.sql a partir del scraper de eventos
├── seed_places.sql     # Seed generado de lugares turísticos (para Supabase)
├── seed_events.sql     # Seed generado de eventos (para Supabase)
└── add_voice.js         # Script de setup: crea la voz personalizada en ElevenLabs

public/                 # Assets estáticos servidos tal cual (favicon, sprites SVG)
```

Ver `DOCUMENTACION.md` para el detalle de cada módulo, el modelo de datos y las integraciones.

## Instrucciones de instalación

Requisitos previos: Node.js 18+ y npm.

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd caboverdianos-ia-assitant

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env y completar las claves (ver sección "Variables de entorno")
```

## Instrucciones de ejecución

```bash
# Entorno de desarrollo (http://localhost:5173)
npm run dev

# Compilar para producción (type-check + build)
npm run build

# Previsualizar el build de producción
npm run preview

# Linter
npm run lint
```

### Scripts de datos (opcionales)

Estos scripts alimentan la base de datos de Supabase con lugares y eventos reales; no son necesarios para levantar la app (que puede correr con datos vacíos o con el proveedor mock), pero sí para tener contenido real en el mapa:

```bash
# 1. Obtener datos de lugares desde Google Places API
node scripts/scraper/scrape-places.js

# 2. Generar el SQL de seed a partir de ese resultado
node scripts/generate_sql_seed.js
# -> ejecutar el archivo scripts/seed_places.sql resultante en el SQL editor de Supabase

# 3. Obtener eventos vigentes por scraping (PlusTicket / eTicket)
node scripts/scraper/scrape-events.js

# 4. Generar el SQL de seed de eventos
node scripts/generate_events_sql_seed.js
# -> ejecutar scripts/seed_events.sql en Supabase

# (Opcional) Crear una voz personalizada "Cipitio" en ElevenLabs a partir de un audio de referencia
node scripts/add_voice.js
```

## Variables de entorno

Definidas en `.env.example`. Copiar a `.env` y completar:

| Variable | Descripción | ¿Requerida? |
|---|---|---|
| `VITE_SUPABASE_URL` | URL del proyecto de Supabase | Sí, para auth y base de datos |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Clave pública (anon) de Supabase | Sí |
| `VITE_GEMINI_API_KEY` | API key de Google Gemini, usada por el chat con el Cipitío | Recomendada — sin ella el chat responde con una respuesta simulada fija |
| `VITE_ELEVENLABS_API_KEY` * | API key de ElevenLabs para texto a voz | No — sin ella se usa la voz nativa del navegador (Web Speech API) |
| `VITE_ELEVENLABS_VOICE_ID` | ID de la voz personalizada en ElevenLabs (ver `scripts/add_voice.js`) | No |
| `VITE_GOOGLE_MAPS_API_KEY` | API key de Google Maps JS, usada para Street View y para las fotos de lugares (Places Photo API) | No — sin ella no hay Street View ni fotos de Google en las tarjetas de lugares |
| `GOOGLE_PLACES_API_KEY` | API key de Google Places (New), usada solo por `scripts/scraper/scrape-places.js` | No — solo necesaria para correr el script de scraping offline |

\* **Nota:** el archivo `.env.example` actual declara esta variable como `VITE_VOICE_API_KEY`, pero el código (`src/services/tts.ts` y `scripts/add_voice.js`) lee `VITE_ELEVENLABS_API_KEY`. Usar este último nombre en el `.env` para que el TTS de ElevenLabs funcione.

## Funcionalidades: completas, simuladas y pendientes

### ✅ Completas (funcionan de punta a punta)
- Landing page de presentación del producto.
- Chat conversacional con el Cipitío (Google Gemini) con salida estructurada (texto + ubicación sugerida con lat/lng).
- Texto a voz de las respuestas del asistente (ElevenLabs, con fallback nativo del navegador).
- Modelo 3D animado del Cipitío (Three.js) con distintas animaciones según el estado del chat.
- Mapa interactivo (Leaflet) con marcadores por categoría, popups y panel de detalle con carrusel de fotos.
- Búsqueda y filtros de lugares/eventos por texto, categoría y precio.
- Trazado de rutas reales por carretera (OSRM) entre la ubicación del usuario y un lugar seleccionado.
- Integración con Google Street View (vista 360°) cuando hay cobertura en la zona.
- Autenticación de usuarios con Google OAuth vía Supabase Auth.
- Encuesta de onboarding para guardar preferencias (categorías, presupuesto, duración del viaje).
- Gamificación: puntos por guardar/visitar lugares, agenda personal con vista de calendario y lista, check-in automático por GPS (+200 pts al estar 10s dentro de un radio de 50m), tienda de cupones canjeables con código QR.
- Scripts de scraping + generación de seed SQL para poblar Supabase con lugares (Google Places) y eventos (PlusTicket/eTicket) reales.

### 🟡 Simuladas / con datos mock
- **Respuesta del chat IA**: si falta `VITE_GEMINI_API_KEY`, `generateTravelResponse` no llama a Gemini y devuelve siempre la misma respuesta de ejemplo ("te recomiendo el Volcán de San Salvador...").
- **Cliente de Supabase**: si faltan las credenciales, se instancia con una URL/clave "placeholder" para no romper el arranque de la app, pero ninguna operación contra la base de datos funcionará (login, puntos, agenda, cupones quedan inoperantes).
- **Catálogo de cupones** (`AVAILABLE_COUPONS` en `src/services/gamification.ts`): está hardcodeado en el frontend, no se lee desde la base de datos. Solo el cupón ya canjeado por el usuario (código único + descuento) se persiste en Supabase.
- **`MockDataTeamProvider`** (`src/services/events/MockDataTeamProvider.ts`): implementación de `EventProvider` con 5 eventos de ejemplo totalmente hardcodeados (festivales, surf, senderismo, etc.), pensada para desarrollar/demostrar la UI sin depender de Supabase. Actualmente `Home.tsx` usa `SupabaseEventProvider`, por lo que este mock queda disponible pero no está conectado en producción.
- **Actividades e itinerario** de los lugares provenientes del scraping de Google Places: no son datos reales, se generan heurísticamente por categoría en `scripts/generate_sql_seed.js` (p. ej. toda playa/lago recibe el mismo itinerario genérico).

### 🔴 Pendientes / limitaciones conocidas
- No existe una suite de tests automatizados (unitarios, de integración o e2e) ni script de test configurado.
- El botón "Guardar como imagen" del cupón (`CouponModal.tsx`) está renderizado pero sin funcionalidad implementada (no tiene `onClick`).
- El pipeline de datos (scraping + generación de SQL) es manual y offline: hay que ejecutar los scripts y correr el `.sql` resultante a mano en el editor SQL de Supabase; no hay actualización programada/automática de lugares o eventos.
- Discrepancia de nombre entre `.env.example` (`VITE_VOICE_API_KEY`) y la variable que realmente lee el código (`VITE_ELEVENLABS_API_KEY`) — ver nota en la tabla de variables de entorno.

## Documentación adicional

Para el detalle de endpoints/APIs externas, el prompt del sistema de IA, el modelo de datos de Supabase y un diagrama de arquitectura, ver [`DOCUMENTACION.md`](./DOCUMENTACION.md).
