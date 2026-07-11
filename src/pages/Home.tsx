import React, { useState } from 'react';
import { Map, MessageSquare, Compass, Loader2 } from 'lucide-react';
import Assistant3D from '../components/Assistant3D';
import { generateTravelResponse } from '../services/ai';
import { speakText } from '../services/tts';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

const Home: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: "¡Hola! Soy tu Asistente de Viajes IA. ¿A dónde te gustaría ir hoy?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');
    const newUserMsg: Message = { id: Date.now().toString(), text: userText, sender: 'user' };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // 1. Obtener respuesta de la IA
      const aiResponseText = await generateTravelResponse(userText);
      
      const newAiMsg: Message = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
      setMessages(prev => [...prev, newAiMsg]);

      // 2. Hablar la respuesta (TTS)
      await speakText(aiResponseText);
    } catch (error) {
      console.error("Error en el chat:", error);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "Lo siento, tuve un problema de conexión.", sender: 'ai' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <Compass className="w-6 h-6 text-purple-400" />
          <h1 className="text-xl font-medium tracking-tight text-white">AI Travel Assistant</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Login
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Panel: 3D Assistant & Chat */}
        <div className="w-1/3 flex flex-col border-r border-white/10 relative z-10 bg-zinc-950/80 backdrop-blur-sm">
          {/* 3D Model Viewport */}
          <div className="h-1/2 border-b border-white/10 relative overflow-hidden bg-gradient-to-b from-zinc-900 to-zinc-950 flex items-center justify-center group">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-zinc-950/0 to-zinc-950/0 pointer-events-none"></div>
             <Assistant3D />
          </div>
          
          {/* Chat Interface */}
          <div className="flex-1 flex flex-col p-4 overflow-hidden">
            <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2 custom-scrollbar">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl max-w-[85%] ${
                    msg.sender === 'user' 
                      ? 'bg-zinc-800 text-zinc-100 rounded-tr-sm' 
                      : 'bg-purple-600/20 border border-purple-500/30 text-purple-50 rounded-tl-sm'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-purple-600/20 border border-purple-500/30 p-3 rounded-2xl rounded-tl-sm">
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Input Area */}
            <div className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask for recommendations..." 
                disabled={isLoading}
                className="w-full bg-zinc-900 border border-white/10 rounded-full py-3 px-5 pr-12 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all disabled:opacity-50"
              />
              <button 
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-full text-white transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="flex-1 relative bg-zinc-900 flex items-center justify-center">
           <p className="text-zinc-500 font-mono text-sm">Leaflet Integration (Phase 4)</p>
        </div>
      </main>
    </div>
  );
};

export default Home;
