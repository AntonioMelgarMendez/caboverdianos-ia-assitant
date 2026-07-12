import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Star, MessageCircle, X, Clock, MapPin, Calendar, Check, Tent, Mountain, Utensils, Landmark, Church, Waves, Navigation2, LocateFixed, Recycle, View } from 'lucide-react';
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

import type { AppEvent } from '../services/events/EventProvider';
import MediaCarousel from './MediaCarousel';

interface InteractiveMapProps {
  aiLocation: { name: string; lat: number; lng: number } | null;
  onAskCipitio: (placeName: string) => void;
  onSaveToAgenda: (placeName: string, lat: number, lng: number, visitDate: string | null) => void;
  isAuthenticated?: boolean;
  searchQuery?: string;
  maxPrice?: number;
  selectedCategories?: string[];
  userLocation?: { lat: number; lng: number } | null;
  events?: AppEvent[];
  forceSelectedEventId?: string | null;
  onEventSelectedStatusChange?: (isSelected: boolean) => void;
}

// Componente para actualizar el centro del mapa dinámicamente
const MapUpdater: React.FC<{ location?: { lat: number, lng: number } | null, zoom?: number }> = ({ location, zoom = 12 }) => {
  const map = useMap();
  React.useEffect(() => {
    if (location) {
      map.flyTo([location.lat, location.lng], zoom, { animate: true, duration: 2 });
    }
  }, [location, map, zoom]);
  return null;
};

// Componente para botones superpuestos del mapa
const MapOverlayButtons: React.FC<{ location?: { lat: number, lng: number } | null }> = ({ location }) => {
  const map = useMap();
  return (
    <div className="absolute bottom-32 right-4 md:bottom-28 md:right-6 z-[1000] flex flex-col gap-3 transition-all">
      {/* Botón AR Experience */}
      <a
        href="https://srhadessvasquezz.github.io/Reto-3---CulturaXR/"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-zinc-900 text-white p-3 rounded-full shadow-2xl border border-white/20 hover:bg-zinc-800 transition-all group flex items-center justify-center"
        title="Ver en Realidad Aumentada"
      >
        <View className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
      </a>

      {/* Botón Mi Ubicación */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (location) {
            map.flyTo([location.lat, location.lng], 15, { animate: true, duration: 1.5 });
          }
        }}
        className="bg-zinc-900 text-white p-3 rounded-full shadow-2xl border border-white/20 hover:bg-zinc-800 transition-all group"
        title="Centrar en mi ubicación"
      >
        <LocateFixed className="w-6 h-6 text-blue-500 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
};

// Función para crear íconos de mapa personalizados
// Caché para evitar crear iconos y llamar a renderToString en cada re-render (mejora dramática del rendimiento)
const iconCache: Record<string, L.DivIcon> = {};

const createCategoryIcon = (category?: string) => {
  const cat = category || 'general';
  if (iconCache[cat]) return iconCache[cat];

  let IconComponent = MapPin;
  let bgClass = "bg-purple-600";
  
  switch (cat) {
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

  const icon = L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  iconCache[cat] = icon;
  return icon;
};

const createRecycleIcon = () => {
  if (iconCache['recycle']) return iconCache['recycle'];
  const iconHtml = renderToString(
    <div className={`w-8 h-8 rounded-full bg-green-500 flex items-center justify-center border-2 border-white shadow-lg text-white`}>
      <Recycle className="w-4 h-4" />
    </div>
  );
  const icon = L.divIcon({
    html: iconHtml,
    className: 'custom-leaflet-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
  iconCache['recycle'] = icon;
  return icon;
};

// Puntos de reciclaje falsos para el MVP
const FAKE_RECYCLING_BINS = [
  { lat: 13.693, lng: -89.218 },
  { lat: 13.698, lng: -89.210 },
  { lat: 13.690, lng: -89.225 },
  { lat: 13.700, lng: -89.220 },
  { lat: 13.685, lng: -89.215 },
  { lat: 13.695, lng: -89.230 },
];

const RecyclingMarkers: React.FC = () => {
  const [zoomLevel, setZoomLevel] = useState(12);
  const map = useMapEvents({
    zoomend: () => {
      setZoomLevel(map.getZoom());
    },
  });

  // Solo mostrar si hay suficiente zoom (15 o más)
  if (zoomLevel < 15) return null;

  return (
    <>
      {FAKE_RECYCLING_BINS.map((bin, i) => (
        <Marker 
          key={`bin-${i}`}
          position={[bin.lat, bin.lng]}
          icon={createRecycleIcon()}
        >
          <Popup>
            <div className="text-center p-2">
              <h3 className="font-bold text-green-600 mb-1 flex items-center justify-center gap-1">
                <Recycle className="w-4 h-4" /> Punto Ecológico
              </h3>
              <p className="text-xs text-zinc-600">Deposita aquí envases para ganar puntos Cipitour.</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
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
  selectedCategories = [],
  userLocation = null,
  events = [],
  forceSelectedEventId = null,
  onEventSelectedStatusChange
}) => {
  const position: [number, number] = [13.6929, -89.2182]; 
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [showRoute, setShowRoute] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][] | null>(null);
  
  // Filtrar eventos basados en búsqueda, precio y categoría
  const filteredEvents = events.filter((evt) => {
    const matchesSearch = evt.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          evt.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = evt.price === null || evt.price === undefined || evt.price <= maxPrice;
    
    // Filtrar por categorías múltiples
    const matchesCategory = selectedCategories.length === 0 || 
                            selectedCategories.includes(evt.category?.toLowerCase() || 'general');

    return matchesSearch && matchesPrice && matchesCategory;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickedDate, setPickedDate] = useState('');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    if (forceSelectedEventId && events.length > 0) {
      const target = events.find(e => e.id === forceSelectedEventId);
      if (target) {
        setSelectedEvent(target);
        setShowRoute(false);
      }
    }
  }, [forceSelectedEventId, events]);

  // Consultar OSRM para trazar ruta por carreteras
  React.useEffect(() => {
    if (showRoute && userLocation && selectedEvent?.lat && selectedEvent?.lng) {
      const fetchRoute = async () => {
        try {
          // OSRM espera longitud,latitud
          const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLocation.lng},${userLocation.lat};${selectedEvent.lng},${selectedEvent.lat}?overview=full&geometries=geojson`);
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            // Convertir GeoJSON [lng, lat] a Leaflet [lat, lng]
            const coords = data.routes[0].geometry.coordinates.map((c: number[]) => [c[1], c[0]]);
            setRouteCoordinates(coords);
          } else {
            setRouteCoordinates(null);
          }
        } catch (e) {
          console.error("OSRM Route Error:", e);
          setRouteCoordinates(null);
        }
      };
      fetchRoute();
    } else {
      setRouteCoordinates(null);
    }
  }, [showRoute, userLocation, selectedEvent]);

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

  // Efecto auxiliar para notificar a los componentes padres si hay un evento seleccionado
  React.useEffect(() => {
    if (onEventSelectedStatusChange) {
      onEventSelectedStatusChange(!!selectedEvent);
    }
  }, [selectedEvent, onEventSelectedStatusChange]);



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
        className="w-full h-full bg-[#1a1a1a]"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          updateWhenZooming={false}
          keepBuffer={4}
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

        {/* Marcador del Usuario (GPS real) */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            zIndexOffset={1000}
            icon={L.divIcon({
              html: '<div class="w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.6)] flex items-center justify-center"><div class="w-2 h-2 rounded-full bg-white"></div></div>',
              className: 'custom-leaflet-icon',
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            })}
          >
            <Popup className="custom-popup">
              <div className="text-zinc-900 font-sans font-bold text-sm text-blue-600">
                Estás aquí
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Renderizado dinámico de eventos */}
        {/* Map Skeleton while loading */}
        {events.length === 0 && (
          <>
            {[
              [13.6929, -89.2182], // San Salvador
              [13.9941, -89.5597], // Santa Ana
              [13.4833, -88.1750], // San Miguel
              [13.4883, -89.3166], // La Libertad (Costa)
              [14.0416, -88.9377], // Chalatenango
              [13.3438, -88.4391], // Usulután
              [13.7188, -89.7241], // Sonsonate
              [13.8291, -88.1066], // Morazán
              [13.9213, -89.8450], // Ahuachapán
              [13.3369, -87.8438], // La Unión
              [13.6444, -88.7841], // San Vicente
              [13.8666, -88.8666]  // Cabañas
            ].map((pos, idx) => (
              <Marker 
                key={`skeleton-${idx}`} 
                position={pos as [number, number]} 
                icon={L.divIcon({
                  html: '<div class="w-8 h-8 rounded-full bg-zinc-800 border-2 border-white/10 shadow-lg animate-pulse flex items-center justify-center"></div>',
                  className: 'custom-leaflet-icon',
                  iconSize: [32, 32],
                  iconAnchor: [16, 32],
                })} 
              />
            ))}
          </>
        )}

        {/* Real Markers */}
        {filteredEvents.map((evt) => (
          <EventMarker 
            key={evt.id} 
            evt={evt}
            onClick={(e) => {
              setSelectedEvent(e);
              setShowRoute(false);
              setShowDatePicker(false);
              setPickedDate('');
              setSavedFeedback(null);
            }}
          />
        ))}

        {/* Marcadores de Reciclaje Falsos (se muestran según zoom) */}
        <RecyclingMarkers />

        {/* Botones Flotantes (AR + Ubicación) */}
        <MapOverlayButtons location={userLocation} />

        {/* Ruta Trazada */}
        {showRoute && routeCoordinates && userLocation && selectedEvent?.lat && selectedEvent?.lng && (
          <Polyline 
            positions={routeCoordinates}
            color="#3b82f6"
            weight={4}
            className="opacity-80"
          />
        )}
      </MapContainer>

      {/* Feedback de guardado */}
      {savedFeedback && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[600] bg-emerald-500 text-white px-5 py-3 rounded-xl shadow-xl shadow-emerald-500/30 flex items-center gap-2 font-bold text-sm animate-bounce">
          <Check className="w-5 h-5" />
          ¡{savedFeedback} guardado en tu Agenda! (+50 pts)
        </div>
      )}

      {/* Info Panel flotante */}
      {selectedEvent && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:bottom-auto md:top-4 md:right-4 z-[500] w-[calc(100vw-2rem)] md:w-96 max-h-[60vh] md:max-h-[90vh] bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 md:slide-in-from-right-10 fade-in">
          
          {/* Media Carousel */}
          {(selectedEvent.imageUrl || (selectedEvent.media && selectedEvent.media.length > 0)) && (
            <div className="relative h-48 w-full overflow-hidden shrink-0">
              <MediaCarousel 
                title={selectedEvent.title}
                event={selectedEvent}
                media={selectedEvent.media || (selectedEvent.imageUrl ? [{ type: 'image' as const, url: selectedEvent.imageUrl }] : [])} 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent pointer-events-none"></div>
              <button 
                onClick={() => {
                  closePanel();
                  setShowRoute(false);
                }}
                className="absolute top-2 right-2 z-[60] bg-black/50 backdrop-blur-sm text-white p-1.5 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Category badge */}
              {selectedEvent.category && (
                <span className="absolute bottom-2 left-2 z-[60] text-[10px] font-bold uppercase tracking-wider bg-purple-600/80 backdrop-blur-sm text-white px-2 py-1 rounded-md">
                  {selectedEvent.category}
                </span>
              )}
            </div>
          )}

          {/* Header (sin imagen) */}
          {!selectedEvent.imageUrl && (!selectedEvent.media || selectedEvent.media.length === 0) && (
            <div className="relative bg-gradient-to-br from-purple-600/30 to-amber-600/20 p-4 border-b border-white/10 shrink-0">
              <button 
                onClick={() => {
                  closePanel();
                  setShowRoute(false);
                }} 
                className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-xl font-bold text-white leading-tight pr-6">{selectedEvent.title}</h3>
            </div>
          )}

          {/* Body — scrollable */}
          <div className="p-4 space-y-3 overflow-y-auto custom-scrollbar flex-1">
            <div className="flex flex-col gap-1">
              <h3 className="font-bold text-white text-base leading-tight">{selectedEvent.title}</h3>
              {userLocation && selectedEvent.lat && selectedEvent.lng && (
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-400/10 w-fit px-2 py-0.5 rounded-md border border-emerald-400/20">
                    <MapPin className="w-3 h-3" />
                    A {(L.latLng(userLocation.lat, userLocation.lng).distanceTo(L.latLng(selectedEvent.lat, selectedEvent.lng)) / 1000).toFixed(1)} km
                  </div>
                  
                  {(!showRoute || !routeCoordinates) && (
                    <button 
                      onClick={() => setShowRoute(true)}
                      disabled={showRoute}
                      className="text-[10px] uppercase tracking-wider font-bold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-2 py-1 rounded-md transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {showRoute ? (
                        <>
                          <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                          Calculando...
                        </>
                      ) : (
                        <>
                          <Navigation2 className="w-3 h-3" />
                          Trazar Ruta
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
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
                <div className="space-y-1.5 pl-2 border-l-2 border-purple-500/30">
                  {selectedEvent.itinerary.map((step, i) => (
                    <div key={i} className="text-[11px] text-zinc-400 leading-snug">
                      {typeof step === 'string' ? (
                        <p>{step}</p>
                      ) : (
                        <p><span className="text-purple-400 font-bold mr-1">{step.time}</span> {step.description}</p>
                      )}
                    </div>
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
