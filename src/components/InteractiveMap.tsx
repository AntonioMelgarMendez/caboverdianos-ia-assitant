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

const InteractiveMap: React.FC = () => {
  // Centro inicial por defecto (ej: Cabo Verde o un lugar turístico)
  const position: [number, number] = [16.5388, -23.0418]; // Cabo Verde (Isla de Sal)

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={position} 
        zoom={10} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false}
      >
        {/* Usando CartoDB Dark Matter para que combine con el tema oscuro */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {/* Placeholder marker */}
        <Marker position={position}>
          <Popup className="custom-popup">
            <div className="text-zinc-900 font-sans">
              <h3 className="font-bold text-sm">Punto Turístico</h3>
              <p className="text-xs">Ubicación recomendada por IA.</p>
            </div>
          </Popup>
        </Marker>
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
