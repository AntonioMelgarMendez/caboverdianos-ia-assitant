import React, { useState, useEffect } from 'react';
import { Map, MessageSquare, Compass, Loader2, LogIn, LogOut, Ticket, Star, MapPin } from 'lucide-react';
import Assistant3D from '../components/Assistant3D';
import InteractiveMap from '../components/InteractiveMap';
import AgendaModal from '../components/AgendaModal';
import CouponModal from '../components/CouponModal';
import LocationTracker from '../components/LocationTracker';
import { generateTravelResponse } from '../services/ai';
import { speakText } from '../services/tts';
import { supabase } from '../services/supabase';
import { getUserPoints, saveLocationToAgendaAndEarnPoints } from '../services/gamification';
import type { User } from '@supabase/supabase-js';

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
  const [user, setUser] = useState<User | null>(null);
  const [aiLocation, setAiLocation] = useState<{name: string, lat: number, lng: number} | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isSavingAgenda, setIsSavingAgenda] = useState(false);
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  useEffect(() => {
    // Verificar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        getUserPoints(currentUser.id).then(setUserPoints);
      }
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        getUserPoints(currentUser.id).then(setUserPoints);
      } else {
        setUserPoints(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleSendMessage = async (overrideText?: string) => {
    const textToSend = overrideText || input.trim();
    if (!textToSend || isLoading) return;

    if (!overrideText) setInput('');
    
    const newUserMsg: Message = { id: Date.now().toString(), text: textToSend, sender: 'user' };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const aiResponse = await generateTravelResponse(updatedMessages);
      const aiResponseText = aiResponse.text;
      
      const newAiMsg: Message = { id: (Date.now() + 1).toString(), text: aiResponseText, sender: 'ai' };
      setMessages(prev => [...prev, newAiMsg]);
      
      if (aiResponse.suggestedLocation) {
        setAiLocation(aiResponse.suggestedLocation);
      }

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
        
        <div className="flex items-center gap-6">
          {user ? (
            <>
              {/* Gamification Dashboard */}
              <div className="flex items-center gap-4 bg-zinc-800/50 px-4 py-1.5 rounded-full border border-white/5">
                <div className="flex items-center gap-1.5 text-amber-400" title="Mis Puntos">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-sm font-bold">{userPoints} pts</span>
                </div>
                <div className="w-px h-4 bg-white/10"></div>
                <button 
                  onClick={() => setIsAgendaOpen(true)}
                  className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors" 
                  title="Mi Agenda"
                >
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Agenda</span>
                </button>
                <div className="w-px h-4 bg-white/10"></div>
                <button 
                  onClick={() => setIsCouponOpen(true)}
                  className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors" 
                  title="Mis Cupones"
                >
                  <Ticket className="w-4 h-4" />
                  <span className="text-sm font-medium">Cupones</span>
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold overflow-hidden border border-purple-400">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.email?.charAt(0).toUpperCase()
                  )}
                </div>
                <button onClick={handleLogout} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-1">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={handleLogin}
              className="text-sm font-medium bg-white text-zinc-900 px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2"
            >
              <LogIn className="w-4 h-4" /> Sign in with Google
            </button>
          )}
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
           <InteractiveMap 
             aiLocation={aiLocation} 
             onAskCipitio={(placeName) => {
               handleSendMessage(`Háblame sobre ${placeName}`);
             }}
             onSaveToAgenda={async (placeName, lat, lng) => {
               if (!user) {
                 alert("Inicia sesión primero para guardar en tu agenda.");
                 return;
               }
               const res = await saveLocationToAgendaAndEarnPoints(user.id, placeName, lat, lng);
               if (res.success) {
                 setUserPoints(res.newTotalPoints);
                 alert(`¡${placeName} guardado en tu Agenda (+50 pts)!`);
               }
             }}
           />
           
           {/* Botón flotante para guardar en agenda */}
           {user && (
             <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]">
               <button 
                 onClick={async () => {
                   if (!aiLocation) return;
                   setIsSavingAgenda(true);
                   const res = await saveLocationToAgendaAndEarnPoints(user.id, aiLocation.name, aiLocation.lat, aiLocation.lng);
                   if (res.success) {
                     setUserPoints(res.newTotalPoints);
                     setAiLocation(null); // Ocultar después de guardar
                   }
                   setIsSavingAgenda(false);
                 }}
                 disabled={isSavingAgenda || !aiLocation}
                 className={`font-bold py-2.5 px-6 rounded-full shadow-lg flex items-center gap-2 transition-transform
                   ${aiLocation 
                     ? 'bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-amber-500/20 hover:scale-105 active:scale-95' 
                     : 'bg-zinc-800 text-zinc-500 cursor-not-allowed opacity-80'}
                 `}
               >
                 {isSavingAgenda ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                 {aiLocation ? `Guardar ${aiLocation.name} (+50 pts)` : 'Pregunta a la IA para guardar un lugar'}
               </button>
             </div>
           )}
        </div>
      </main>

      {user && (
        <>
          <AgendaModal 
            isOpen={isAgendaOpen} 
            onClose={() => setIsAgendaOpen(false)} 
            userId={user.id} 
          />
          <CouponModal
            isOpen={isCouponOpen}
            onClose={() => setIsCouponOpen(false)}
            userId={user.id}
            userPoints={userPoints}
            onPointsUpdated={(pts) => setUserPoints(pts)}
          />
          <LocationTracker 
            userId={user.id} 
            onPointsEarned={(pts) => setUserPoints(pts)} 
          />
        </>
      )}
    </div>
  );
};

export default Home;
