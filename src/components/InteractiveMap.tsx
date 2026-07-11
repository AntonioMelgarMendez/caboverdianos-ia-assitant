import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
  onSaveToAgenda?: (placeName: string, lat: number, lng: number) => void;
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
  // Centro inicial por defecto (El Salvador)
  const position: [number, number] = [13.6929, -89.2182]; 
  const [events, setEvents] = React.useState<AppEvent[]>([]);

  React.useEffect(() => {
    // Configurable: se puede cambiar este provider por otro que llame a Supabase o cualquier API
    const eventProvider = new MockDataTeamProvider();
    
    eventProvider.getEvents().then((data) => {
      setEvents(data);
    }).catch(err => console.error('Error fetching events', err));
  }, []);

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
          <Marker key={evt.id} position={[evt.lat, evt.lng]}>
            <Popup className="custom-popup min-w-[200px]">
              <div className="text-zinc-900 font-sans">
                <h3 className="font-bold text-sm text-purple-600">📅 {evt.title}</h3>
                <p className="text-xs mt-1">{evt.description}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-zinc-500">{evt.date}</p>
                  {evt.hours && <p className="text-xs text-amber-600 font-medium">🕒 {evt.hours}</p>}
                </div>
                
                {/* Interacciones directas */}
                <div className="mt-3 flex flex-col gap-2 border-t border-zinc-200 pt-2">
                  <button 
                    onClick={() => onSaveToAgenda?.(evt.title, evt.lat, evt.lng)}
                    className="w-full text-left px-2 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-bold rounded flex items-center gap-2 transition-colors"
                  >
                    ⭐ Guardar en Agenda (+50 pts)
                  </button>
                  <button 
                    onClick={() => onAskCipitio?.(evt.title)}
                    className="w-full text-left px-2 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 text-xs font-bold rounded flex items-center gap-2 transition-colors"
                  >
                    ✨ Preguntarle al Cipitío
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Overlay controls if needed */}
      <div className="absolute bottom-6 right-6 z-[400] flex gap-2 pointer-events-none">
         <span className="bg-zinc-900/80 backdrop-blur-md text-zinc-300 text-xs px-3 py-1.5 rounded-full border border-white/10 pointer-events-auto">
           Mapa Interactivo (Leaflet)
         </span>
      </div>
    </div>
  );
};

export default InteractiveMap;
