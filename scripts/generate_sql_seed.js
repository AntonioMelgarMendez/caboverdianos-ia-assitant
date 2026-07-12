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
  ADD COLUMN IF NOT EXISTS department TEXT;

-- Vaciar tabla actual si quieres reemplazarla (opcional, comentado por defecto)
-- TRUNCATE TABLE public.places;

-- Insertar nuevos lugares
INSERT INTO public.places (name, description, lat, lng, category, municipality, department) VALUES\n`;

  const values = places.map((place) => {
    const name = escapeSql(place.name);
    
    // Usar 'notes' como descripción, si no, null
    let descriptionStr = place.notes;
    if (!descriptionStr && place.google?.details?.formattedAddress) {
      descriptionStr = place.google.details.formattedAddress;
    }
    const description = escapeSql(descriptionStr);
    
    const lat = place.google?.details?.lat || 0;
    const lng = place.google?.details?.lng || 0;
    
    const category = escapeSql(place.category);
    const municipality = escapeSql(place.municipio);
    const department = escapeSql(place.departamento);

    return `  (${name}, ${description}, ${lat}, ${lng}, ${category}, ${municipality}, ${department})`;
  });

  sql += values.join(',\n') + ';\n';

  fs.writeFileSync(sqlOutputPath, sql, 'utf8');
  console.log(`Archivo generado con éxito en: ${sqlOutputPath}`);
}

run();
