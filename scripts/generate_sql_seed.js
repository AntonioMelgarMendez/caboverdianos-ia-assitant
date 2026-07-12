import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawDataPath = path.join(__dirname, 'places.raw.json');
const sqlOutputPath = path.join(__dirname, 'seed_places.sql');

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  // Reemplazar comillas simples con doble comilla simple para escapar en SQL
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
  ADD COLUMN IF NOT EXISTS reviews JSONB;

-- Vaciar tabla actual si quieres reemplazarla (opcional, comentado por defecto)
-- TRUNCATE TABLE public.places;

-- Insertar nuevos lugares
INSERT INTO public.places (name, description, lat, lng, category, municipality, department, rating, user_ratings_total, images, reviews) VALUES\n`;

  const values = places.map((place) => {
    const name = escapeSql(place.name);
    
    // Usar 'editorialSummary' si existe, luego 'notes'
    let descriptionStr = place.google?.details?.editorialSummary;
    if (!descriptionStr) descriptionStr = place.notes;
    if (!descriptionStr) descriptionStr = place.google?.details?.formattedAddress;
    const description = escapeSql(descriptionStr);
    
    const lat = place.google?.details?.lat || 0;
    const lng = place.google?.details?.lng || 0;
    
    const category = escapeSql(place.category);
    const municipality = escapeSql(place.municipio);
    const department = escapeSql(place.departamento);
    
    const rating = place.google?.details?.rating || 'NULL';
    const userRatingsTotal = place.google?.details?.userRatingsTotal || 'NULL';
    
    const images = escapeArray(place.google?.details?.photoNames);
    const reviews = escapeJson(place.google?.details?.reviews);

    return `  (${name}, ${description}, ${lat}, ${lng}, ${category}, ${municipality}, ${department}, ${rating}, ${userRatingsTotal}, ${images}, ${reviews})`;
  });

  sql += values.join(',\n') + ';\n';

  fs.writeFileSync(sqlOutputPath, sql, 'utf8');
  console.log(`Archivo generado con éxito en: ${sqlOutputPath}`);
}

run();
