import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Star, MessageCircle, X, Clock, MapPin, Calendar, Check, Search, Filter, Tent, Mountain, Utensils, Landmark, Church, Waves } from 'lucide-react';
import { renderToString } from 'react-dom/server';
// Arreglo para los íconos de Leaflet en React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

import type { EventProvider, AppEvent } from '../services/events/EventProvider';
import { MockDataTeamProvider } from '../services/events/MockDataTeamProvider';
import { useMap } from 'react-leaflet';
import MediaCarousel from './MediaCarousel';

interface InteractiveMapProps {
  aiLocation: { name: string; lat: number; lng: number } | null;
  onAskCipitio: (placeName: string) => void;
  onSaveToAgenda: (placeName: string, lat: number, lng: number, visitDate: string | null) => void;
  isAuthenticated?: boolean;
  searchQuery?: string;
  maxPrice?: number;
  selectedCategory?: string;
}

// Componente para actualizar el centro del mapa dinámicamente
const MapUpdater: React.FC<{ location?: { lat: number, lng: number } | null }> = ({ location }) => {
  const map = useMap();
  React.useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], 12, { animate: true, duration: 2 });
    }
  }, [location, map]);
  return null;
};

// Función para crear íconos de mapa personalizados
const createCategoryIcon = (category?: string) => {
  let IconComponent = MapPin;
  let bgClass = "bg-purple-600";
  
  switch (category) {
    case 'aventura': IconComponent = Tent; bgClass = "bg-amber-600"; break;
    case 'naturaleza': IconComponent = Mountain; bgClass = "bg-green-600"; break;
    case 'gastronomía': IconComponent = Utensils; bgClass = "bg-orange-600"; break;
    case 'cultura': IconComponent = Landmark; bgClass = "bg-blue-600"; break;
    case 'religioso': IconComponent = Church; bgClass = "bg-indigo-600"; break;
    case 'deportes': IconComponent = Waves; bgClass = "bg-cyan-600"; break;
  }

  const iconHtml = renderToString(
    <div className={`w-8 h-8 rounded-full ${bgClass} flex items-center justify-center border-2 border-white shadow-lg text-white`}>
      <IconComponent className="w-4 h-4" />
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

// Subcomponente para Marker que usa useMap para volar hacia él
const EventMarker: React.FC<{ 
  evt: AppEvent, 
  onClick: (e: AppEvent) => void 
}> = ({ evt, onClick }) => {
  const map = useMap();
  return (
    <Marker 
      position={[evt.lat, evt.lng]}
      icon={createCategoryIcon(evt.category)}
      eventHandlers={{
        click: () => {
          map.flyTo([evt.lat, evt.lng], 15, { animate: true, duration: 1.5 });
          onClick(evt);
        }
      }}
    />
  );
};

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  aiLocation, 
  onAskCipitio, 
  onSaveToAgenda, 
  isAuthenticated = false,
  searchQuery = '',
  maxPrice = 1000,
  selectedCategory = 'all'
}) => {
  const position: [number, number] = [13.6929, -89.2182]; 
  const [events, setEvents] = React.useState<AppEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  
  // Filtrar eventos basados en búsqueda, precio y categoría
  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = evt.price === null || evt.price === undefined || evt.price <= maxPrice;
    
    // Si la categoría seleccionada es 'all', no filtramos por categoría
    // Si la categoría seleccionada es un mapeo especial, ajustamos
    let eventCategoryForMatch = evt.category || '';
    if (eventCategoryForMatch === 'deportes') eventCategoryForMatch = 'playa'; // Mapeo si es necesario
    const matchesCategory = selectedCategory === 'all' || 
                            eventCategoryForMatch.toLowerCase() === selectedCategory.toLowerCase() ||
                            (selectedCategory === 'playa' && evt.category === 'deportes') ||
                            (selectedCategory === 'montaña' && evt.category === 'naturaleza');

    return matchesSearch && matchesPrice && matchesCategory;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickedDate, setPickedDate] = useState('');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  // Cargar eventos al iniciar
  React.useEffect(() => {
    async function fetchEvents() {
      const provider = new MockDataTeamProvider();
      const fetchedEvents = await provider.getEvents();
      setEvents(fetchedEvents);
    }
    fetchEvents();
  }, []);

  const isEvent = (evt: AppEvent) => !!evt.startTime;

  const handleSaveClick = useCallback(() => {
    if (!selectedEvent) return;
    
    if (isEvent(selectedEvent)) {
      // Es un evento con fecha fija → guardar directo con su fecha
      onSaveToAgenda?.(selectedEvent.title, selectedEvent.lat, selectedEvent.lng, selectedEvent.date);
      setSavedFeedback(selectedEvent.title);
      setTimeout(() => { setSavedFeedback(null); setSelectedEvent(null); }, 2000);
    } else {
      // Es un lugar sin fecha → mostrar date picker
      setShowDatePicker(true);
    }
  }, [selectedEvent, onSaveToAgenda]);

  const handleDateConfirm = useCallback(() => {
    if (!selectedEvent || !pickedDate) return;
    onSaveToAgenda?.(selectedEvent.title, selectedEvent.lat, selectedEvent.lng, pickedDate);
    setSavedFeedback(selectedEvent.title);
    setShowDatePicker(false);
    setPickedDate('');
    setTimeout(() => { setSavedFeedback(null); setSelectedEvent(null); }, 2000);
  }, [selectedEvent, pickedDate, onSaveToAgenda]);

  const handleAsk = useCallback(() => {
    if (!selectedEvent) return;
    onAskCipitio?.(selectedEvent.title);
    setSelectedEvent(null);
  }, [selectedEvent, onAskCipitio]);

  const closePanel = () => {
    setSelectedEvent(null);
    setShowDatePicker(false);
    setPickedDate('');
  };

  // Formato de la fecha actual para el min del date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={position} 
        zoom={9} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapUpdater location={aiLocation} />
        
        {/* Marcador dinámico de la IA */}
        {aiLocation && (
          <Marker position={[aiLocation.lat, aiLocation.lng]}>
            <Popup className="custom-popup">
              <div className="text-zinc-900 font-sans">
                <h3 className="font-bold text-sm text-amber-600">✨ {aiLocation.name}</h3>
                <p className="text-xs mt-1">Recomendación del Cipitío</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Renderizado dinámico de eventos */}
        {filteredEvents.map((evt) => (
          <EventMarker 
            key={evt.id} 
            evt={evt}
            onClick={(e) => {
              setSelectedEvent(e);
              setShowDatePicker(false);
              setPickedDate('');
              setSavedFeedback(null);
            }}
          />
        ))}
      </MapContainer>

      {/* Feedback de guardado */}
      {savedFeedback && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-xl shadow-emerald-500/30 flex items-center gap-2 font-bold text-sm animate-bounce">
          <Check className="w-5 h-5" />
          ¡{savedFeedback} guardado en tu Agenda! (+50 pts)
        </div>
      )}

      {/* Panel lateral de React — FUERA de Leaflet */}
      {selectedEvent && !savedFeedback && (
        <div className="absolute top-4 right-4 z-[500] w-80 max-h-[calc(100%-2rem)] bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col">
          
          {/* Media Carousel */}
          {(selectedEvent.imageUrl || (selectedEvent.media && selectedEvent.media.length > 0)) && (
            <div className="relative h-48 w-full overflow-hidden shrink-0">
              <MediaCarousel 
                title={selectedEvent.title}
                event={selectedEvent}
                media={selectedEvent.media || (selectedEvent.imageUrl ? [{ type: 'image', url: selectedEvent.imageUrl }] : [])} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent pointer-events-none"></div>
              <button 
                onClick={closePanel}
                className="absolute top-2 right-2 z-20 bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Category badge */}
              {selectedEvent.category && (
                <span className="absolute top-2 left-2 z-10 text-[10px] font-bold uppercase tracking-wider bg-purple-600/80 backdrop-blur-sm text-white px-2 py-1 rounded-md">
                  {selectedEvent.category}
                </span>
              )}
            </div>
          )}

          {/* Header (sin imagen) */}
          {!selectedEvent.imageUrl && (
            <div className="relative bg-gradient-to-br from-purple-600/30 to-amber-600/20 p-4 border-b border-white/10 shrink-0">
              <button onClick={closePanel} className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
              <h3 className="font-bold text-white text-base pr-6">{selectedEvent.title}</h3>
            </div>
          )}

          {/* Body — scrollable */}
          <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
            <h3 className="font-bold text-white text-base">{selectedEvent.title}</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{selectedEvent.description}</p>
            
            {/* Metadatos */}
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">
                📆 {selectedEvent.date}
              </span>
              {selectedEvent.startTime && selectedEvent.endTime && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md">
                  <Clock className="w-3 h-3" /> {selectedEvent.startTime} — {selectedEvent.endTime}
                </span>
              )}
              {selectedEvent.price !== undefined && (
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md font-bold">
                  {selectedEvent.price === null || selectedEvent.price === 0 ? '🎉 Gratis' : `💵 $${selectedEvent.price} ${selectedEvent.currency || ''}`}
                </span>
              )}
              {selectedEvent.ageRange && (
                <span className="inline-flex items-center gap-1 text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-md">
                  👥 {selectedEvent.ageRange}
                </span>
              )}
            </div>

            {/* Actividades */}
            {selectedEvent.activities && selectedEvent.activities.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Actividades</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedEvent.activities.map((act, i) => (
                    <span key={i} className="text-[11px] bg-zinc-800 text-zinc-300 px-2 py-1 rounded-md">
                      {act}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerario */}
            {selectedEvent.itinerary && selectedEvent.itinerary.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Itinerario</h4>
                <div className="space-y-1 pl-2 border-l-2 border-purple-500/30">
                  {selectedEvent.itinerary.map((step, i) => (
                    <p key={i} className="text-[11px] text-zinc-400 leading-snug">{step}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Date Picker (solo para lugares sin fecha fija) */}
            {showDatePicker && (
              <div className="bg-zinc-800 border border-white/10 rounded-xl p-3 space-y-2">
                <label className="text-xs text-zinc-400 font-bold flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> ¿Qué día quieres ir?
                </label>
                <input 
                  type="date" 
                  min={today}
                  value={pickedDate}
                  onChange={(e) => setPickedDate(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-purple-500"
                />
                {isAuthenticated ? (
                  <button
                    onClick={handleDateConfirm}
                    disabled={!pickedDate}
                    className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Confirmar y Guardar (+50 pts)
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-zinc-800 text-zinc-500 text-sm font-bold rounded-lg border border-white/5 cursor-not-allowed">
                    <Star className="w-4 h-4 opacity-50" />
                    Inicia sesión para agendar
                  </div>
                )}
              </div>
            )}

            {/* Botones de acción */}
            {!showDatePicker && (
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                {isAuthenticated ? (
                  <button 
                    onClick={handleSaveClick}
                    className="w-full flex items-center gap-2 px-3 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/20"
                  >
                    <Star className="w-4 h-4" />
                    {isEvent(selectedEvent) 
                      ? `Agendar para ${selectedEvent.date} (+50 pts)` 
                      : 'Guardar en Agenda (+50 pts)'}
                  </button>
                ) : (
                  <div className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-800 text-zinc-500 text-sm font-bold rounded-xl border border-white/5 cursor-not-allowed">
                    <Star className="w-4 h-4 opacity-50" />
                    Inicia sesión para agendar
                  </div>
                )}
                <button 
                  onClick={handleAsk}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  Preguntarle al Asistente
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Overlay label */}
      <div className="absolute bottom-6 right-6 z-[400] flex gap-2 pointer-events-none">
         <span className="bg-zinc-900/80 backdrop-blur-md text-zinc-300 text-xs px-3 py-1.5 rounded-full border border-white/10 pointer-events-auto">
           Mapa Interactivo (Leaflet)
         </span>
      </div>
    </div>
  );
};

export default InteractiveMap;
