import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawDataPath = path.join(__dirname, 'events.raw (1).json');
const sqlOutputPath = path.join(__dirname, 'seed_events.sql');

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

function escapeArray(arr) {
  if (!arr || !Array.isArray(arr) || arr.length === 0) return 'ARRAY[]::TEXT[]';
  const escapedElements = arr.map(el => escapeSql(el));
  return `ARRAY[${escapedElements.join(', ')}]`;
}

function run() {
  const rawContent = fs.readFileSync(rawDataPath, 'utf8');
  const parsed = JSON.parse(rawContent);
  const events = parsed.events || [];

  let sql = `-- Generado automáticamente para Eventos\n`;
  sql += `INSERT INTO public.places (name, description, lat, lng, category, images) VALUES\n`;

  const values = events.map((evt) => {
    const name = escapeSql(evt.title || evt.eventName || 'Evento');
    
    const venue = evt.venue || evt.lugar || 'Ubicación Pendiente';
    const date = evt.dateText || evt.fecha || '';
    const time = evt.timeText || evt.hora || '';
    const url = evt.eventUrl || '';
    
    const descriptionStr = `📍 Lugar: ${venue}\n📅 Fecha: ${date} ${time}\n🔗 Reservar/Info: ${url}`;
    const description = escapeSql(descriptionStr);
    
    // Coordenadas aleatorias alrededor de San Salvador para tener distribución visual
    const baseLat = 13.6929;
    const baseLng = -89.2182;
    const lat = baseLat + (Math.random() - 0.5) * 0.1;
    const lng = baseLng + (Math.random() - 0.5) * 0.1;
    
    let cat = 'general';
    const t = name.toLowerCase();
    if (t.includes('musical') || t.includes('concierto') || t.includes('teatro')) cat = 'cultura';
    if (t.includes('carrera') || t.includes('aeróbica')) cat = 'deportes';
    
    const category = escapeSql(cat);
    
    // El frontend espera las imágenes en el array de la BD.
    const imagesArr = evt.imageUrl ? [evt.imageUrl] : [];
    const images = escapeArray(imagesArr);

    return `  (${name}, ${description}, ${lat}, ${lng}, ${category}, ${images})`;
  });

  sql += values.join(',\n') + ';\n';

  fs.writeFileSync(sqlOutputPath, sql, 'utf8');
  console.log(`Archivo SQL generado en: ${sqlOutputPath}`);
}

run();
