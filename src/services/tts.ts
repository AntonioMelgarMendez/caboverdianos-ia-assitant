// TTS Service

export async function speakText(text: string): Promise<void> {
  const elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const elevenLabsVoiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID;

  if (elevenLabsApiKey && elevenLabsVoiceId) {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}?output_format=mp3_44100_128`, {
        method: 'POST',
        headers: {
          'xi-api-key': elevenLabsApiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        return new Promise((resolve) => {
          audio.onended = () => resolve();
          audio.play().catch(e => {
            console.error("Error al reproducir audio:", e);
            resolve();
          });
        });
      } else {
        console.warn("Error en ElevenLabs API, usando fallback nativo.");
      }
    } catch (e) {
      console.warn("Error de red con ElevenLabs, usando fallback nativo.", e);
    }
  }

  // Fallback: Web Speech API (Nativo del navegador y gratuito)
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      console.warn("Web Speech API no está soportada en este navegador.");
      reject(new Error("TTS no soportado"));
      return;
    }

    // Detener cualquier síntesis previa
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurar idioma español
    utterance.lang = 'es-ES';
    utterance.rate = 1.1; // Velocidad ligeramente más rápida
    utterance.pitch = 1.4; // Tono más agudo

    // Intentar buscar una voz en español de mejor calidad (femenina/niño si es posible)
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(voice => 
        voice.lang.includes('es') && 
        (voice.name.toLowerCase().includes('google') || 
         voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('monica') || 
         voice.name.toLowerCase().includes('paula'))
    ) || voices.find(voice => voice.lang.includes('es'));
    
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      console.error("Error en TTS:", e);
      resolve(); // Resolvemos de todos modos para que el flujo de la app no se bloquee
    };

    window.speechSynthesis.speak(utterance);
  });
}
