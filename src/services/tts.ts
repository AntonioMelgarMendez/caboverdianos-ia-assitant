// TTS Service

export async function speakText(text: string): Promise<void> {
  const apiKey = import.meta.env.VITE_VOICE_API_KEY;

  if (apiKey) {
    // Aquí se implementaría la lógica para una API externa (ej. ElevenLabs)
    // Ejemplo comentado:
    /*
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/voice_id', {
      method: 'POST',
      headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' })
    });
    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    await audio.play();
    return;
    */
    console.log("VITE_VOICE_API_KEY detectada, pero integración externa pendiente. Usando Web Speech API...");
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
    utterance.onerror = (e) => reject(e);

    window.speechSynthesis.speak(utterance);
  });
}
