import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { ChevronLeft, ChevronRight, Maximize2, X, Play } from 'lucide-react';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface MediaCarouselProps {
  media: MediaItem[];
  title?: string;
}

const MediaCarousel: React.FC<MediaCarouselProps> = ({ media, title = "Media" }) => {
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
        <div className={`relative w-full h-full flex items-center justify-center bg-black ${isFull ? '' : 'overflow-hidden rounded-t-2xl'}`}>
          <video 
            src={item.url} 
            controls={isFull} 
            autoPlay={isFull}
            muted={!isFull}
            loop={!isFull}
            className={`w-full h-full object-contain ${isFull ? '' : 'object-cover pointer-events-none'}`}
          />
          {!isFull && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Play className="w-5 h-5 text-white fill-white ml-1" />
              </div>
            </div>
          )}
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
            : 'object-cover rounded-t-2xl'
        }`}
        onClick={(e) => {
          if (isFull) {
            e.stopPropagation();
            setIsZoomed(!isZoomed);
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
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {media.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all ${idx === safeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                />
              ))}
            </div>
          </>
        )}
        
        {/* Botón Pantalla Completa */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsFullScreen(true);
            setIsZoomed(false);
          }}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
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
          <div className="w-full h-full flex items-center justify-center p-4 md:p-12 overflow-hidden">
            {renderMediaContent(currentItem, true)}
          </div>

          {/* Controles Modal */}
          {media.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors z-50"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white transition-colors z-50"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default MediaCarousel;
