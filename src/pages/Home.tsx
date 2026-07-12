import React, { useState, useEffect } from 'react';
import { Map, MessageSquare, Compass, Loader2, LogIn, LogOut, Ticket, Star, MapPin, Search, Filter, X } from 'lucide-react';
import Assistant3D from '../components/Assistant3D';
import InteractiveMap from '../components/InteractiveMap';
import AgendaModal from '../components/AgendaModal';
import CouponModal from '../components/CouponModal';
import CustomFilterDropdown from '../components/CustomFilterDropdown';
import LocationTracker from '../components/LocationTracker';
import { generateTravelResponse } from '../services/ai';
import { speakText } from '../services/tts';
import { supabase } from '../services/supabase';
import { getUserPoints, saveLocationToAgendaAndEarnPoints } from '../services/gamification';
import { hasCompletedOnboarding } from '../services/userPreferences';
import OnboardingSurvey from '../components/OnboardingSurvey';
import type { User } from '@supabase/supabase-js';
import { SupabaseEventProvider } from '../services/events/SupabaseEventProvider';
import type { AppEvent } from '../types/AppEvent';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
};

const Home: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('ai_assistant_chat');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error("Error parsing chat history", e); }
    }
    return [{ id: '1', text: "¡Hola! Soy tu Asistente de Viajes IA. ¿A dónde te gustaría ir hoy?", sender: 'ai' }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [aiLocation, setAiLocation] = useState<{name: string, lat: number, lng: number} | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [isSavingAgenda, setIsSavingAgenda] = useState(false);
  const [isAgendaOpen, setIsAgendaOpen] = useState(false);
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Estados para Búsqueda y Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [forceSelectedEventId, setForceSelectedEventId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isMapEventSelected, setIsMapEventSelected] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function fetchEvents() {
      const provider = new SupabaseEventProvider();
      const fetchedEvents = await provider.getEvents();
      setEvents(fetchedEvents);
    }
    fetchEvents();
  }, []);

  const previewResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    return events
      .filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.description.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 5);
  }, [searchQuery, events]);

  useEffect(() => {
    localStorage.setItem('ai_assistant_chat', JSON.stringify(messages));
  }, [messages]);

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        getUserPoints(currentUser.id).then(setUserPoints);
        // Check if onboarding is needed
        const completed = await hasCompletedOnboarding(currentUser.id);
        if (!completed) {
          setShowOnboarding(true);
        }
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

      speakText(aiResponseText).catch(err => console.error("Error TTS:", err));
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
      <header className="relative flex flex-col md:flex-row items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-white/10 bg-zinc-900/50 backdrop-blur-md z-10 gap-3 md:gap-0">
        
        {/* ROW 1: Logo + User Info (Solo en móvil actúan como fila 1, en desktop todo es una fila) */}
        <div className="flex w-full md:w-auto items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-purple-400 shrink-0" />
            <h1 className="text-xl font-medium tracking-tight text-white hidden md:block">AI Travel Assistant</h1>
          </div>
          
          {/* USER INFO (Mobile version only. We hide this on desktop and show it at the end to keep the DOM logical, or we just render it once here and use CSS to order it? Actually, it's easier to just keep it in DOM order and let CSS flex-col handle mobile, and on desktop, order-3 moves it to the right!) */}
        </div>
        
        {/* Controles de Búsqueda Globales (Fila 2 en móvil, Centro en Desktop) */}
        <div className="w-full md:w-auto md:flex-1 md:max-w-2xl mx-0 md:mx-8 flex items-center gap-2 md:gap-4 order-3 md:order-2">
          <div className="relative flex items-center bg-zinc-800/50 rounded-full border border-white/10 px-3 md:px-4 py-2 w-full group focus-within:border-purple-500 focus-within:bg-zinc-800 transition-colors">
            <Search className="w-4 h-4 text-zinc-400 group-focus-within:text-purple-400" />
            <input 
              type="text"
              placeholder="Buscar un evento, lugar..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowPreview(true);
              }}
              onFocus={() => setShowPreview(true)}
              onBlur={() => setTimeout(() => setShowPreview(false), 200)}
              className="bg-transparent border-none outline-none text-white text-xs md:text-sm w-full placeholder-zinc-500 ml-2"
            />
            {/* Predictive Preview Dropdown */}
            {showPreview && previewResults.length > 0 && (
              <div className="absolute top-[110%] left-0 w-full bg-zinc-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                {previewResults.map(evt => (
                  <div 
                    key={evt.id} 
                    className="flex flex-col px-4 py-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-0"
                    onClick={() => {
                      setForceSelectedEventId(evt.id);
                      setSearchQuery('');
                      setShowPreview(false);
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400 shrink-0" />
                      <span className="text-white font-medium text-sm truncate">{evt.title}</span>
                    </div>
                    {evt.category && (
                      <span className="text-[10px] text-zinc-500 uppercase tracking-wider ml-6">{evt.category}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <CustomFilterDropdown 
            selectedCategories={selectedCategories}
            onChangeCategories={setSelectedCategories}
            maxPrice={maxPrice}
            onChangeMaxPrice={setMaxPrice}
          />
        </div>

        {/* Gamification y Perfil (Fila 1 en móvil flotando a la derecha, Fila 1 derecha en Desktop) */}
        <div className="flex items-center gap-4 md:gap-6 order-2 md:order-3 absolute md:relative top-3 right-4 md:top-auto md:right-auto">
          {user ? (
            <>
              {/* Gamification Dashboard */}
              <div className="flex items-center gap-3 md:gap-4 bg-zinc-800/50 px-3 md:px-4 py-1.5 rounded-full border border-white/5">
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
                  <span className="hidden md:inline text-sm font-medium">Agenda</span>
                </button>
                <div className="w-px h-4 bg-white/10"></div>
                <button 
                  onClick={() => setIsCouponOpen(true)}
                  className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors" 
                  title="Mis Cupones"
                >
                  <Ticket className="w-4 h-4" />
                  <span className="hidden md:inline text-sm font-medium">Cupones</span>
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
                <button onClick={handleLogout} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors hidden md:flex items-center gap-1">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </>
          ) : (
            <button 
              onClick={handleLogin}
              className="text-xs md:text-sm font-medium bg-white text-zinc-900 px-3 md:px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <LogIn className="w-4 h-4" /> <span className="hidden sm:inline">Sign in with Google</span><span className="sm:hidden">Sign in</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden">
        {/* Fullscreen Map */}
        <div className="absolute inset-0 bg-zinc-900 z-0">
           <InteractiveMap 
             events={events}
             forceSelectedEventId={forceSelectedEventId}
             aiLocation={aiLocation}
             userLocation={userLocation}
             isAuthenticated={!!user} 
             searchQuery={searchQuery}
             selectedCategories={selectedCategories}
             maxPrice={maxPrice}
             onEventSelectedStatusChange={setIsMapEventSelected}
             onAskCipitio={(placeName) => {
               handleSendMessage(`Háblame sobre ${placeName}`);
               setIsChatOpen(true);
             }}
             onSaveToAgenda={async (placeName, lat, lng, visitDate) => {
               if (!user) {
                 alert("Inicia sesión primero para guardar en tu agenda.");
                 return;
               }
               const res = await saveLocationToAgendaAndEarnPoints(user.id, placeName, lat, lng, visitDate);
               if (res.success) {
                 setUserPoints(res.newTotalPoints);
               }
             }}
           />
           
           {/* Panel flotante para guardar AI location en agenda */}
           {user && aiLocation && (
             <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[1000]">
               <div className="bg-zinc-900/95 backdrop-blur-xl border border-amber-500/30 rounded-2xl shadow-xl shadow-amber-500/10 p-4 w-72">
                 <h4 className="text-sm font-bold text-white mb-1">✨ {aiLocation.name}</h4>
                 <p className="text-xs text-zinc-400 mb-3">Recomendación del Cipitío</p>
                 <label className="text-xs text-zinc-500 font-bold mb-1 block">¿Qué día quieres ir?</label>
                 <input 
                   type="date"
                   min={new Date().toISOString().split('T')[0]}
                   id="ai-date-picker"
                   className="w-full bg-zinc-800 border border-white/10 text-white text-sm px-3 py-2 rounded-lg mb-3 focus:outline-none focus:border-purple-500"
                 />
                 <div className="flex gap-2">
                   <button 
                     onClick={async () => {
                       const dateInput = document.getElementById('ai-date-picker') as HTMLInputElement;
                       const visitDate = dateInput?.value || null;
                       setIsSavingAgenda(true);
                       const res = await saveLocationToAgendaAndEarnPoints(user.id, aiLocation.name, aiLocation.lat, aiLocation.lng, visitDate);
                       setIsSavingAgenda(false);
                       if (res.success) {
                         setUserPoints(res.newTotalPoints);
                         setAiLocation(null);
                       }
                     }}
                     disabled={isSavingAgenda}
                     className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center"
                   >
                     {isSavingAgenda ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar y ganar pts'}
                   </button>
                   <button 
                     onClick={() => setAiLocation(null)}
                     className="px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
                   >
                     <X className="w-4 h-4" />
                   </button>
                 </div>
               </div>
             </div>
           )}
        </div>

        {/* Floating AI Assistant & Chat */}
        <div className={`absolute bottom-6 left-4 md:left-6 z-[1000] items-end gap-4 pointer-events-none ${isMapEventSelected && !isChatOpen ? 'hidden md:flex' : 'flex'}`}>
          
          {/* 3D Model Container (Bigger and Transparent) */}
          <div className="relative pointer-events-auto flex items-end gap-2">
            <div className="w-24 h-32 md:w-48 md:h-64 relative flex items-end justify-center drop-shadow-2xl transition-all">
              <Assistant3D />
            </div>

            {/* Separate Chat Toggle Button */}
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="relative w-14 h-14 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg shadow-purple-600/30 flex items-center justify-center transition-transform hover:scale-105 mb-4"
            >
              {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
              {!isChatOpen && messages.length > 1 && (
                <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-purple-600 animate-pulse"></div>
              )}
            </button>
          </div>
          
          {/* Chat Panel */}
          {isChatOpen && (
            <div className="fixed inset-x-0 bottom-0 rounded-t-3xl rounded-b-none border-b-0 md:static md:w-80 md:rounded-2xl md:border-b h-[60vh] md:h-[500px] max-h-[70vh] bg-zinc-950/95 md:bg-zinc-950/90 backdrop-blur-xl border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] md:shadow-2xl flex flex-col overflow-hidden pointer-events-auto transition-all animate-in slide-in-from-bottom-full md:slide-in-from-bottom-10 fade-in z-[2000] md:z-auto">
              <div className="p-4 md:p-3 border-b border-white/10 bg-zinc-900/50 flex justify-between items-center rounded-t-3xl md:rounded-t-none">
                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-purple-400" /> Chat con Cipitío
                </h3>
                <button onClick={() => setIsChatOpen(false)} className="text-zinc-400 hover:text-white transition-colors bg-white/5 md:bg-transparent p-1.5 md:p-0 rounded-full">
                  <X className="w-5 h-5 md:w-4 md:h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
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
              <div className="p-3 border-t border-white/10 bg-zinc-900/50">
                <div className="relative">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe aquí..." 
                    disabled={isLoading}
                    className="w-full bg-zinc-950 border border-white/10 rounded-full py-2 px-4 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all disabled:opacity-50"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-full text-white transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                  </button>
                </div>
              </div>
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
            onPointsUpdated={(pts) => setUserPoints(pts)}
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
            userLocation={userLocation}
            setUserLocation={setUserLocation}
          />
        </>
      )}
      {/* Onboarding Survey Modal */}
      {showOnboarding && user && (
        <OnboardingSurvey
          userId={user.id}
          onComplete={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
};

export default Home;
