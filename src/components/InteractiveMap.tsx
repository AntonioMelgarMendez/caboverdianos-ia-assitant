import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Star, MessageCircle, X, Clock, MapPin, Calendar, Check } from 'lucide-react';

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
import { MockDataTeamProvider } from '../services/events/MockDataTeamProvider';
import { useMap } from 'react-leaflet';

interface MapProps {
  aiLocation?: { name: string, lat: number, lng: number } | null;
  onAskCipitio?: (placeName: string) => void;
  onSaveToAgenda?: (placeName: string, lat: number, lng: number, visitDate: string | null) => void;
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

const InteractiveMap: React.FC<MapProps> = ({ aiLocation, onAskCipitio, onSaveToAgenda }) => {
  const position: [number, number] = [13.6929, -89.2182]; 
  const [events, setEvents] = React.useState<AppEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<AppEvent | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickedDate, setPickedDate] = useState('');
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  React.useEffect(() => {
    const eventProvider = new MockDataTeamProvider();
    eventProvider.getEvents().then((data) => {
      setEvents(data);
    }).catch(err => console.error('Error fetching events', err));
  }, []);

  const isEvent = (evt: AppEvent) => !!evt.hours;

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
        {events.map((evt) => (
          <Marker 
            key={evt.id} 
            position={[evt.lat, evt.lng]}
            eventHandlers={{
              click: () => {
                setSelectedEvent(evt);
                setShowDatePicker(false);
                setPickedDate('');
                setSavedFeedback(null);
              }
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
        <div className="absolute top-4 right-4 z-[500] w-72 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
          
          {/* Header */}
          <div className="relative bg-gradient-to-br from-purple-600/30 to-amber-600/20 p-4 border-b border-white/10">
            <button 
              onClick={closePanel}
              className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-bold text-white text-base pr-6">
              {isEvent(selectedEvent) ? '📅' : '📍'} {selectedEvent.title}
            </h3>
            {isEvent(selectedEvent) && (
              <span className="inline-block mt-1 text-[10px] bg-purple-500/30 text-purple-300 px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">
                Evento
              </span>
            )}
          </div>

          {/* Body */}
          <div className="p-4 space-y-3">
            <p className="text-sm text-zinc-300">{selectedEvent.description}</p>
            
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-zinc-400 bg-zinc-800 px-2 py-1 rounded-md">
                📆 {selectedEvent.date}
              </span>
              {selectedEvent.hours && (
                <span className="inline-flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md">
                  <Clock className="w-3 h-3" /> {selectedEvent.hours}
                </span>
              )}
            </div>

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
                <button
                  onClick={handleDateConfirm}
                  disabled={!pickedDate}
                  className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-zinc-950 text-sm font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" /> Confirmar y Guardar (+50 pts)
                </button>
              </div>
            )}

            {/* Botones de acción */}
            {!showDatePicker && (
              <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
                <button 
                  onClick={handleSaveClick}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-amber-500/20"
                >
                  <Star className="w-4 h-4" />
                  {isEvent(selectedEvent) 
                    ? `Guardar en ${selectedEvent.date} (+50 pts)` 
                    : 'Guardar en Agenda (+50 pts)'}
                </button>
                <button 
                  onClick={handleAsk}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 text-purple-200 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                >
                  <MessageCircle className="w-4 h-4" />
                  Preguntarle al Cipitío
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
