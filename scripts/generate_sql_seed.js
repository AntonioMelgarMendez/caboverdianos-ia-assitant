import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawDataPath = path.join(__dirname, 'places.raw.json');
const sqlOutputPath = path.join(__dirname, 'seed_places.sql');

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeArray(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 'ARRAY[]::TEXT[]';
  const escapedElements = arr.map(el => escapeSql(el));
  return `ARRAY[${escapedElements.join(', ')}]`;
}

function escapeJson(obj) {
  if (!obj) return 'NULL';
  return escapeSql(JSON.stringify(obj)) + '::JSONB';
}

function getMockDataByCategory(category) {
  const cat = (category || '').toLowerCase();
  
  if (cat.includes('playa') || cat.includes('lago') || cat.includes('agua')) {
    return {
      age: 'Todas las edades',
      activities: ['Natación', 'Fotografía', 'Relajación', 'Deportes Acuáticos'],
      agenda: [
        { time: '09:00 AM', description: 'Llegada y acomodación' },
        { time: '10:00 AM', description: 'Tiempo libre para baño' },
        { time: '01:00 PM', description: 'Almuerzo con gastronomía local' },
        { time: '04:00 PM', description: 'Disfrutar del atardecer' }
      ]
    };
  } else if (cat.includes('volcan') || cat.includes('montaña') || cat.includes('naturaleza') || cat.includes('parque nacional')) {
    return {
      age: '+12 años (Rutas exigentes)',
      activities: ['Senderismo', 'Camping', 'Observación de Flora/Fauna', 'Fotografía'],
      agenda: [
        { time: '07:00 AM', description: 'Inicio del recorrido o caminata' },
        { time: '11:30 AM', description: 'Llegada a miradores o cumbres' },
        { time: '12:30 PM', description: 'Descanso y almuerzo ligero' },
        { time: '03:00 PM', description: 'Descenso y finalización' }
      ]
    };
  } else if (cat.includes('museo') || cat.includes('cultura') || cat.includes('histórico') || cat.includes('religioso') || cat.includes('arqueológico')) {
    return {
      age: 'Todas las edades',
      activities: ['Tour Guiado', 'Fotografía (sin flash)', 'Compra de Souvenirs', 'Recorrido Histórico'],
      agenda: [
        { time: '10:00 AM', description: 'Llegada y compra de entradas' },
        { time: '10:15 AM', description: 'Inicio del tour guiado' },
        { time: '12:00 PM', description: 'Visita libre por las instalaciones' },
        { time: '01:00 PM', description: 'Finalización de la visita' }
      ]
    };
  } else {
    return {
      age: 'Todas las edades',
      activities: ['Exploración libre', 'Fotografía', 'Gastronomía Local'],
      agenda: [
        { time: 'Flexible', description: 'Llegada al destino' },
        { time: 'Flexible', description: 'Recorrido por los puntos de interés' },
        { time: 'Flexible', description: 'Tiempo libre' }
      ]
    };
  }
}

function run() {
  console.log('Leyendo archivo places.raw.json...');
  const rawData = fs.readFileSync(rawDataPath, 'utf8');
  const json = JSON.parse(rawData);
  const places = json.places || [];

  console.log(`Encontrados ${places.length} lugares. Generando SQL...`);

  let sql = `-- Script generado automáticamente para seed de lugares
-- Actualizar esquema de la tabla places
ALTER TABLE public.places 
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS municipality TEXT,
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS user_ratings_total INTEGER,
  ADD COLUMN IF NOT EXISTS images TEXT[],
  ADD COLUMN IF NOT EXISTS reviews JSONB,
  ADD COLUMN IF NOT EXISTS recommended_age TEXT,
  ADD COLUMN IF NOT EXISTS activities JSONB,
  ADD COLUMN IF NOT EXISTS agenda JSONB;

-- Vaciar tabla actual si quieres reemplazarla (opcional, comentado por defecto)
-- TRUNCATE TABLE public.places;

-- Insertar nuevos lugares
INSERT INTO public.places (name, description, lat, lng, category, municipality, department, rating, user_ratings_total, images, reviews, recommended_age, activities, agenda) VALUES\n`;

  const values = places.map((place) => {
    const name = escapeSql(place.name);
    
    let descriptionStr = place.google?.details?.editorialSummary;
    if (!descriptionStr) descriptionStr = place.notes;
    if (!descriptionStr) descriptionStr = place.google?.details?.formattedAddress;
    const description = escapeSql(descriptionStr);
    
    const lat = place.google?.details?.lat || 0;
    const lng = place.google?.details?.lng || 0;
    
    const categoryStr = place.category;
    const category = escapeSql(categoryStr);
    const municipality = escapeSql(place.municipio);
    const department = escapeSql(place.departamento);
    
    const rating = place.google?.details?.rating || 'NULL';
    const userRatingsTotal = place.google?.details?.userRatingsTotal || 'NULL';
    
    const images = escapeArray(place.google?.details?.photoNames);
    const reviews = escapeJson(place.google?.details?.reviews);

    // Auto-generar data extra
    const mockData = getMockDataByCategory(categoryStr);
    const recommended_age = escapeSql(mockData.age);
    const activities = escapeJson(mockData.activities);
    const agenda = escapeJson(mockData.agenda);

    return `  (${name}, ${description}, ${lat}, ${lng}, ${category}, ${municipality}, ${department}, ${rating}, ${userRatingsTotal}, ${images}, ${reviews}, ${recommended_age}, ${activities}, ${agenda})`;
  });

  sql += values.join(',\n') + ';\n';

  fs.writeFileSync(sqlOutputPath, sql, 'utf8');
  console.log(`Archivo generado con éxito en: ${sqlOutputPath}`);
}

run();
