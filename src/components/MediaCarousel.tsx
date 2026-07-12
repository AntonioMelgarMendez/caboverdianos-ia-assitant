import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ChevronLeft, ChevronRight, X, Image as ImageIcon, Map as MapIcon, Loader2, Maximize2 } from 'lucide-react';

import type { AppEvent } from '../services/events/EventProvider';
import GoogleStreetView from './GoogleStreetView';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnailUrl?: string;
}

interface MediaCarouselProps {
  media: MediaItem[];
  title?: string;
  event?: AppEvent;
}

// Componente para cargar imágenes con un esqueleto
const ImageWithSkeleton = ({ src, alt, className, onClick }: { src: string, alt: string, className: string, onClick?: (e: React.MouseEvent) => void }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden bg-zinc-900" onClick={onClick}>
      {!loaded && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-900 animate-pulse">
          <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full ${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

const MediaCarousel: React.FC<MediaCarouselProps> = ({ media, title = "Media", event }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'streetview'>('photos');

  React.useEffect(() => {
    setCurrentIndex(0);
    setIsFullScreen(false);
    setIsZoomed(false);
    setActiveTab('photos');
  }, [media, event?.id]);

  if (!media || media.length === 0) return null;

  const nextSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const safeIndex = currentIndex >= media.length ? 0 : currentIndex;
  const currentItem = media[safeIndex];
  
  const hasLocation = event?.lat && event?.lng;

  const renderMediaContent = (item: MediaItem, isFull: boolean) => {
    if (!item) return null;
    
    if (item.type === 'video') {
      return (
        <div className={`absolute inset-0 flex items-center justify-center bg-black ${isFull ? '' : 'overflow-hidden rounded-t-2xl cursor-pointer'}`}
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

    const imgSrc = !isFull && item.thumbnailUrl ? item.thumbnailUrl : item.url;
    
    return (
      <ImageWithSkeleton 
        src={imgSrc} 
        alt={title || 'Media'} 
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

  const renderStreetView = (isFull: boolean) => {
    if (!hasLocation) return null;
    return (
      <div 
        className={`absolute inset-0 ${!isFull ? 'rounded-t-2xl overflow-hidden' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {!isFull && (
          <div 
            className="absolute top-2 right-2 z-50 bg-black/50 backdrop-blur-sm p-1 rounded-lg cursor-pointer hover:bg-black/80 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullScreen(true);
            }}
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </div>
        )}
        <GoogleStreetView lat={event!.lat!} lng={event!.lng!} />
      </div>
    );
  };

  return (
    <>
      <div className="relative h-48 w-full group flex flex-col">
        {/* Pestañas de Navegación */}
        {hasLocation && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-[60] flex gap-1 p-1 bg-black/40 backdrop-blur-md rounded-full shadow-lg">
            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab('photos'); }}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'photos' ? 'bg-purple-600 text-white' : 'text-zinc-300 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3 h-3" />
              Fotos
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setActiveTab('streetview'); }}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'streetview' ? 'bg-emerald-600 text-white' : 'text-zinc-300 hover:text-white'
              }`}
            >
              <MapIcon className="w-3 h-3" />
              360°
            </button>
          </div>
        )}

        <div className="w-full flex-1 relative">
          {activeTab === 'photos' ? renderMediaContent(currentItem, false) : renderStreetView(false)}
          
          {activeTab === 'photos' && media.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-[70]"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/60 z-[70]"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-[70] pointer-events-none">
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
      </div>

      {isFullScreen && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center"
          onClick={() => setIsFullScreen(false)}
        >
          <div className="absolute top-0 inset-x-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent z-50">
            {activeTab === 'photos' ? (
              <h3 className="text-white font-medium text-sm truncate px-4">{title} - {safeIndex + 1} de {media.length}</h3>
            ) : (
              <h3 className="text-white font-medium text-sm truncate px-4">{title} - Vista 360°</h3>
            )}
            
            <div className="flex gap-4">
              {hasLocation && (
                <div className="flex gap-1 p-1 bg-white/10 backdrop-blur-md rounded-full mr-4">
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab('photos'); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${
                      activeTab === 'photos' ? 'bg-purple-600 text-white' : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    Fotos
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveTab('streetview'); }}
                    className={`px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 transition-colors ${
                      activeTab === 'streetview' ? 'bg-emerald-600 text-white' : 'text-zinc-300 hover:text-white'
                    }`}
                  >
                    <MapIcon className="w-4 h-4" />
                    360°
                  </button>
                </div>
              )}
              <button 
                onClick={() => setIsFullScreen(false)}
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="w-full h-full pt-20 pb-4 px-4 md:px-12 flex flex-col md:flex-row gap-6 overflow-hidden">
            <div className={`relative flex items-center justify-center overflow-hidden ${event ? 'w-full md:w-2/3 lg:w-3/4' : 'w-full'} h-1/2 md:h-full rounded-2xl`}>
              {activeTab === 'photos' ? renderMediaContent(currentItem, true) : renderStreetView(true)}

              {activeTab === 'photos' && media.length > 1 && (
                <>
                  <button 
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-colors z-50"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md flex items-center justify-center text-white transition-colors z-50"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>

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

                {event.ageRange && (
                  <div className="mt-2">
                    <h3 className="text-sm font-bold text-emerald-400 mb-1 uppercase tracking-wider">Edad Recomendada</h3>
                    <p className="text-sm text-zinc-300 bg-white/5 inline-block px-3 py-1 rounded-full border border-white/10">{event.ageRange}</p>
                  </div>
                )}

                {event.activities && event.activities.length > 0 && (
                  <div className="mt-2">
                    <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Actividades</h3>
                    <div className="flex flex-wrap gap-2">
                      {event.activities.map((act, idx) => (
                        <span key={idx} className="text-xs font-medium text-blue-200 bg-blue-900/30 px-2.5 py-1 rounded-md border border-blue-500/20">
                          {act}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {event.itinerary && event.itinerary.length > 0 && (
                  <div className="mt-2">
                    <h3 className="text-sm font-bold text-purple-400 mb-2 uppercase tracking-wider">Agenda Sugerida</h3>
                    <ul className="space-y-3">
                      {event.itinerary.map((item, idx) => (
                        <li key={idx} className="text-sm flex gap-3 bg-black/20 p-2.5 rounded-lg border border-white/5">
                          {typeof item === 'string' ? (
                            <>
                              <span className="text-purple-500 mt-0.5">•</span>
                              <span className="text-zinc-300">{item}</span>
                            </>
                          ) : (
                            <>
                              <span className="text-purple-400 font-bold whitespace-nowrap min-w-[70px]">{item.time}</span>
                              <span className="text-zinc-300">{item.description}</span>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      , document.body)}
    </>
  );
};

export default MediaCarousel;
