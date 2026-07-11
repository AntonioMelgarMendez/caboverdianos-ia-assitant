import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.VITE_ELEVENLABS_API_KEY;
const AUDIO_FILE_PATH = process.argv[2]; // Pasa la ruta del audio por argumento

if (!API_KEY) {
  console.error('Error: No se encontró VITE_ELEVENLABS_API_KEY en .env');
  process.exit(1);
}

if (!AUDIO_FILE_PATH || !fs.existsSync(AUDIO_FILE_PATH)) {
  console.error('Error: Debes proveer una ruta válida al archivo de audio.');
  console.error('Uso: node scripts/add_voice.js ruta/al/audio.mp3');
  process.exit(1);
}

async function addVoice() {
  console.log(`Subiendo archivo: ${AUDIO_FILE_PATH}...`);
  
  const form = new FormData();
  form.append('name', 'Cipitio');
  
  // En Node.js 18+, fetch con FormData y archivos se hace con Blob
  const fileBuffer = fs.readFileSync(AUDIO_FILE_PATH);
  const blob = new Blob([fileBuffer], { type: 'audio/mpeg' });
  form.append('files', blob, 'audio.mp3');

  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY
      },
      body: form
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de la API:', errorData);
      return;
    }

    const data = await response.json();
    console.log('✅ Voz creada exitosamente!');
    console.log(`👉 VOICE ID: ${data.voice_id}`);
    console.log('Copia este VOICE ID y pégalo en tu archivo .env como VITE_ELEVENLABS_VOICE_ID');
    
  } catch (err) {
    console.error('Ocurrió un error en la conexión:', err);
  }
}

addVoice();
