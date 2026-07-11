import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ChevronLeft, ChevronRight, Maximize2, X, Play } from 'lucide-react';

import type { AppEvent } from '../services/events/EventProvider';

import GoogleStreetView from './GoogleStreetView';

interface MediaItem {
  type: 'image' | 'video' | 'streetview';
  url?: string;
  lat?: number;
  lng?: number;
}

interface MediaCarouselProps {
  media: MediaItem[];
  title?: string;
  event?: AppEvent;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ media, title = "Media", event }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  React.useEffect(() => {
    setCurrentIndex(0);
    setIsFullScreen(false);
    setIsZoomed(false);
  }, [media]);

  if (!media || media.length === 0) return null;

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  // Si la media cambia y el índice quedó fuera de rango, usamos el 0 de forma segura en este render
  const safeIndex = currentIndex >= media.length ? 0 : currentIndex;
  const currentItem = media[safeIndex];

  const renderMediaContent = (item: MediaItem, isFull: boolean) => {
    if (!item) return null; // Prevención extra
    if (item.type === 'video') {
      return (
        <div className={`relative w-full h-full flex items-center justify-center bg-black ${isFull ? '' : 'overflow-hidden rounded-t-2xl cursor-pointer'}`}
             onClick={(e) => {
               if (!isFull) {
                 e.stopPropagation();
                 setIsFullScreen(true);
                 setIsZoomed(false);
               }
             }}
        >
          <video 
            src={item.url} 
            controls={isFull} 
            autoPlay={true}
            muted={!isFull}
            loop={true}
            playsInline
            className={`w-full h-full object-contain ${isFull ? '' : 'object-cover pointer-events-none'}`}
          />
        </div>
      );
    }
    if (item.type === 'streetview') {
      if (!isFull) {
        return (
          <div 
            className="relative w-full h-full flex flex-col items-center justify-center bg-zinc-900 overflow-hidden rounded-t-2xl cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullScreen(true);
              setIsZoomed(false);
            }}
          >
            {/* Street View Thumbnail Placeholder */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <img 
              src={`https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${item.lat},${item.lng}&fov=90&heading=235&pitch=10&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`}
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              alt="Street View Thumbnail"
              onError={(e) => {
                // Si la miniatura estática falla, ocultar la imagen
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="z-20 flex flex-col items-center justify-center">
              <div className="w-12 h-12 bg-purple-600/80 rounded-full flex items-center justify-center mb-2 backdrop-blur-sm border border-white/20">
                <span className="font-bold text-white text-xs">360°</span>
              </div>
              <span className="text-white text-xs font-medium">Explorar Street View</span>
            </div>
          </div>
        );
      }
      return (
        <div className="w-full h-full relative">
          <GoogleStreetView lat={item.lat!} lng={item.lng!} />
        </div>
      );
    }

    return (
      <img 
        src={item.url} 
        alt={title} 
        className={`w-full h-full ${
          isFull 
            ? `object-contain transition-transform duration-300 ${isZoomed ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}` 
            : 'object-cover rounded-t-2xl cursor-pointer'
        }`}
        onClick={(e) => {
          if (isFull) {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
          } else {
            e.stopPropagation();
            setIsFullScreen(true);
            setIsZoomed(false);
          }
        }}
      />
    );
  };

  return (
    <>
      {/* Vista Miniatura (Dentro de la tarjeta) */}
      <div className="relative h-48 w-full group">
        {renderMediaContent(currentItem, false)}
        
        {/* Controles Miniatura */}
        {media.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            
            {/* Indicadores */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 pointer-events-none">
              {media.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all ${idx === safeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal de Pantalla Completa */}
      {isFullScreen && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          onClick={() => setIsFullScreen(false)}
        >
          {/* Header del Modal */}
          <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-50">
            <h3 className="text-white font-medium text-sm truncate px-4">{title} - {safeIndex + 1} de {media.length}</h3>
            <button 
              onClick={() => setIsFullScreen(false)}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Contenido Principal Modal */}
          <div className="w-full h-full pt-16 pb-4 px-4 md:px-12 flex flex-col md:flex-row gap-6 overflow-hidden">
            {/* Contenedor de Media */}
            <div className={`relative flex items-center justify-center overflow-hidden ${event ? 'w-full md:w-2/3 lg:w-3/4' : 'w-full'} h-1/2 md:h-full`}>
              {renderMediaContent(currentItem, true)}

              {/* Controles Modal */}
              {media.length > 1 && (
                <>
                  <button 
                    onClick={prevSlide}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-colors z-50"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-colors z-50"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Detalles del Evento */}
            {event && (
              <div 
                className="w-full md:w-1/3 lg:w-1/4 h-1/2 md:h-full overflow-y-auto bg-zinc-900/50 rounded-2xl border border-white/10 p-6 flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
                  <p className="text-zinc-300 text-sm leading-relaxed">{event.description}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <p className="text-xs text-zinc-500 font-bold uppercase">Precio</p>
                    <p className="text-amber-500 font-bold text-lg">{event.price ? `$${event.price}` : 'Gratis'}</p>
                  </div>
                  <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                    <p className="text-xs text-zinc-500 font-bold uppercase">Categoría</p>
                    <p className="text-white font-medium capitalize">{event.category || 'General'}</p>
                  </div>
                </div>

                {event.itinerary && event.itinerary.length > 0 && (
                  <div className="mt-2">
                    <h3 className="text-sm font-bold text-purple-400 mb-2 uppercase tracking-wider">Itinerario</h3>
                    <ul className="space-y-2">
                      {event.itinerary.map((item, idx) => (
                        <li key={idx} className="text-sm text-zinc-300 flex items-start gap-2">
                          <span className="text-purple-500 mt-1">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {event.activities && event.activities.length > 0 && (
                  <div className="mt-2">
                    <h3 className="text-sm font-bold text-emerald-400 mb-2 uppercase tracking-wider">Actividades</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.activities.map((act, idx) => (
                        <span key={idx} className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-md border border-emerald-500/30">
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default MediaCarousel;
