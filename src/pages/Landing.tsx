import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Map, MessageSquare, Ticket, Star, Sparkles, MapPin, ChevronRight, Navigation2, Zap } from 'lucide-react';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden selection:bg-purple-500/30">
      {/* Background Decorative Orbs */}
      <div className="absolute top-0 left-1/2 w-[800px] h-[400px] bg-purple-600/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[150px] translate-x-1/3 translate-y-1/3 pointer-events-none"></div>

      {/* Navbar Minimalista */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6">
        <div className="flex items-center gap-2">
          <Compass className="w-8 h-8 text-purple-400" />
          <span className="text-xl font-bold tracking-tight">AI Travel</span>
        </div>
        <Link 
          to="/app"
          className="text-sm font-bold bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full transition-all border border-white/5 backdrop-blur-md"
        >
          Iniciar App
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-24 md:pt-32 pb-20 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-widest mb-8">
          <Sparkles className="w-4 h-4" /> La revolución del Turismo local
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-[1.1]">
          Descubre tu país con un <br className="hidden md:block" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
            Asistente Inteligente
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Explora rutas, descubre lugares ocultos, recibe recomendaciones por voz de nuestra IA en 3D, y gana recompensas reales por tus viajes.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            to="/app"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/30"
          >
            Abrir el Mapa <ChevronRight className="w-5 h-5" />
          </Link>
          <a 
            href="#features"
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-white/10 px-8 py-4 rounded-full font-bold text-lg transition-all"
          >
            Saber más
          </a>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section id="features" className="relative z-10 px-6 md:px-12 py-24 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Todo lo que necesitas para tu viaje</h2>
          <p className="text-zinc-400">Una suite completa de herramientas diseñadas para la exploración moderna.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">
          
          {/* Feature 1: Asistente 3D */}
          <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-colors group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">El Cipitío: Tu Guía IA 3D</h3>
              <p className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed">
                Interactúa con un modelo 3D animado en tiempo real. Hazle preguntas sobre cualquier destino, historia o recomendación y te responderá con voz, mostrándote en el mapa a dónde ir.
              </p>
            </div>
          </div>

          {/* Feature 2: Navegación OSRM */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-colors group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
             <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30">
                <Navigation2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Rutas Precisas</h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Trazado automático de rutas por carretera utilizando Open Source Routing Machine (OSRM) para que nunca te pierdas.
              </p>
            </div>
          </div>

          {/* Feature 3: Puntos y Agenda */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-colors group relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
             <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Agenda y GPS</h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Guarda lugares para visitar después y gana puntos reales automáticamente cuando el GPS detecte que has llegado a tu destino.
              </p>
            </div>
          </div>

          {/* Feature 4: Cupones */}
          <div className="md:col-span-2 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 rounded-3xl border border-white/5 hover:border-pink-500/30 transition-colors group relative overflow-hidden flex flex-col md:flex-row md:items-center gap-8">
            <div className="absolute top-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl group-hover:bg-pink-500/20 transition-all"></div>
            <div className="relative z-10 flex-1">
              <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6 border border-pink-500/30">
                <Ticket className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Recompensas Reales</h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Usa los puntos ganados explorando el país para canjear cupones de descuento y entradas gratis a museos, parques y eventos especiales de nuestros aliados.
              </p>
            </div>
            <div className="relative z-10 w-full md:w-48 h-32 bg-zinc-950 rounded-xl border border-white/10 flex items-center justify-center shadow-inner overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
               <div className="flex items-center gap-2 text-pink-400 font-black text-xl italic tracking-tighter -skew-x-12">
                 <Zap className="w-6 h-6 fill-pink-400" /> 100 PTS
               </div>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-12 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Compass className="w-6 h-6 text-purple-400" />
            <span className="text-lg font-bold">AI Travel</span>
          </div>
          <p className="text-zinc-500 text-sm">
            © {new Date().getFullYear()} Creado con tecnología Leaflet, Supabase y Google Gemini.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
