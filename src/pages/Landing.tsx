import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, MessageSquare, Ticket, Star, Sparkles, ChevronRight, Navigation2, Zap, ArrowDown } from 'lucide-react';
import heroImg from '../assets/hero.jpg';

const Landing: React.FC = () => {
  return (
    <div className="w-full bg-zinc-950 text-white overflow-x-hidden selection:bg-purple-500/30">

      {/* ======================= HERO: FULL VIEWPORT ======================= */}
      <section className="relative w-full h-screen flex flex-col overflow-hidden">

        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(168,85,247,0.12)_0%,transparent_60%)] pointer-events-none z-[1]"></div>

        {/* Navbar */}
        <nav className="relative z-30 flex items-center justify-between px-6 md:px-12 py-6">
          <div className="flex items-center gap-2">
            <Compass className="w-7 h-7 text-purple-400" />
            <span className="text-lg font-bold tracking-tight">AI Travel</span>
          </div>
          <Link
            to="/app"
            className="text-sm font-bold bg-white/10 hover:bg-white/20 px-5 py-2.5 rounded-full transition-all border border-white/10 backdrop-blur-md"
          >
            Iniciar App
          </Link>
        </nav>

        {/* Hero Content: Text Left + Model Right */}
        <div className="relative z-10 flex-1 flex flex-col-reverse md:flex-row items-center max-w-7xl mx-auto w-full px-6 md:px-12">
          
          {/* Left: Text */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left pb-12 md:pb-0">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px] font-bold uppercase tracking-widest mb-6 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" /> Potenciado por Inteligencia Artificial
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-5 leading-[1.08]">
              Tu guía turístico{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400">
                vive dentro del mapa
              </span>
            </h1>

            <p className="text-base md:text-lg text-zinc-400 max-w-lg mb-8 leading-relaxed">
              Conoce al Cipitío, un asistente 3D con IA que te guía por voz, traza rutas y te recompensa por explorar.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                to="/app"
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/40"
              >
                Explorar Ahora <ChevronRight className="w-5 h-5" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 text-zinc-400 hover:text-white px-6 py-4 rounded-full font-medium transition-all group"
              >
                Ver características <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>

          {/* Right: Static Image instead of 3D Model */}
          <div className="flex-1 w-full flex justify-center items-center relative py-12 md:py-0">
            <img 
              src={heroImg} 
              alt="Cipitio Tourist Assistant" 
              className="w-full max-w-md md:max-w-xl rounded-[40px] shadow-[0_0_100px_rgba(168,85,247,0.3)] object-cover"
            />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 animate-bounce pointer-events-none">
          <div className="w-5 h-8 border-2 border-white/20 rounded-full flex items-start justify-center p-1">
            <div className="w-1 h-2 bg-white/40 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* ======================= FEATURES SECTION ======================= */}
      <section id="features" className="relative z-10 px-6 md:px-12 py-28 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <p className="text-purple-400 font-bold text-sm uppercase tracking-widest mb-3">Características</p>
          <h2 className="text-3xl md:text-5xl font-bold mb-5">Todo lo que necesitas para tu viaje</h2>
          <p className="text-zinc-500 max-w-lg mx-auto">Una suite de herramientas diseñadas para la exploración moderna del turismo local.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-min">

          {/* Feature 1: Asistente 3D — Large card */}
          <div className="md:col-span-2 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-8 md:p-10 rounded-3xl border border-white/5 hover:border-purple-500/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px] group-hover:bg-purple-500/20 transition-all duration-700"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/30 group-hover:scale-110 transition-transform">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">El Cipitío: Tu Guía IA 3D</h3>
              <p className="text-zinc-400 text-sm md:text-base max-w-md leading-relaxed">
                Interactúa con un modelo 3D animado en tiempo real. Hazle preguntas sobre cualquier destino, historia o recomendación y te responderá con voz, mostrándote en el mapa a dónde ir.
              </p>
            </div>
          </div>

          {/* Feature 2: Navegación OSRM */}
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-8 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-all duration-700"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/30 group-hover:scale-110 transition-transform">
                <Navigation2 className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Rutas Precisas</h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Trazado automático de rutas reales por carretera con OSRM. Clic en un lugar, traza la ruta y ve la distancia exacta.
              </p>
            </div>
          </div>

          {/* Feature 3: Puntos y Agenda */}
          <div className="bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-8 rounded-3xl border border-white/5 hover:border-amber-500/30 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-[80px] group-hover:bg-amber-500/20 transition-all duration-700"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/30 group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Agenda & GPS</h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Guarda lugares para visitar y gana puntos automáticamente cuando el GPS detecte que has llegado a tu destino.
              </p>
            </div>
          </div>

          {/* Feature 4: Cupones — Large card */}
          <div className="md:col-span-2 bg-gradient-to-br from-zinc-900/80 to-zinc-950 p-8 md:p-10 rounded-3xl border border-white/5 hover:border-pink-500/30 transition-all duration-500 group relative overflow-hidden flex flex-col md:flex-row md:items-center gap-8">
            <div className="absolute top-0 left-0 w-80 h-80 bg-pink-500/10 rounded-full blur-[100px] group-hover:bg-pink-500/20 transition-all duration-700"></div>
            <div className="relative z-10 flex-1">
              <div className="w-12 h-12 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-6 border border-pink-500/30 group-hover:scale-110 transition-transform">
                <Ticket className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-3">Recompensas Reales</h3>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md">
                Canjea tus puntos por cupones de descuento y entradas gratis a museos, parques y eventos de nuestros aliados.
              </p>
            </div>
            <div className="relative z-10 w-full md:w-52 h-36 bg-zinc-950 rounded-2xl border border-white/10 flex items-center justify-center shadow-inner overflow-hidden group-hover:border-pink-500/20 transition-colors">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent"></div>
              <div className="flex items-center gap-2 text-pink-400 font-black text-2xl italic tracking-tighter -skew-x-12">
                <Zap className="w-7 h-7 fill-pink-400" /> 100 PTS
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= CTA SECTION ======================= */}
      <section className="relative z-10 pt-16 pb-24 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.04] to-purple-500/[0.08] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <div className="w-14 h-14 bg-purple-500/15 rounded-full flex items-center justify-center mx-auto mb-6 border border-purple-500/20">
            <Compass className="w-7 h-7 text-purple-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para explorar?</h2>
          <p className="text-zinc-500 mb-8 leading-relaxed">Abre el mapa interactivo y déjate guiar por el Cipitío en tu próxima aventura turística.</p>
          <Link
            to="/app"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-10 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-600/30"
          >
            Explorar Ahora <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ======================= FOOTER ======================= */}
      <footer className="relative z-10 border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-bold">AI Travel</span>
          </div>
          <p className="text-zinc-600 text-xs">
            © {new Date().getFullYear()} · Leaflet · Supabase · Google Gemini
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
