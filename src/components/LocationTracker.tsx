import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Trophy, CheckCircle2 } from 'lucide-react';
import { getUserAgenda, markAgendaVisitedAndEarnPoints } from '../services/gamification';
import type { AgendaItem } from '../services/gamification';

interface LocationTrackerProps {
  userId: string;
  onPointsEarned: (newPoints: number) => void;
}

// Haversine formula para calcular distancia en metros
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Radio de la tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // en metros
}

const REQUIRED_SECONDS = 10;
const RADIUS_METERS = 50;

const LocationTracker: React.FC<LocationTrackerProps> = ({ userId, onPointsEarned }) => {
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [activeItem, setActiveItem] = useState<AgendaItem | null>(null);
  const [secondsAtLocation, setSecondsAtLocation] = useState(0);
  const [showCelebration, setShowCelebration] = useState<{title: string, points: number} | null>(null);

  useEffect(() => {
    // Cargar agenda pendiente
    const loadAgenda = async () => {
      if (userId) {
        const items = await getUserAgenda(userId);
        setAgenda(items.filter(i => i.status === 'pending'));
      }
    };
    loadAgenda();
    const interval = setInterval(loadAgenda, 15000); // recargar cada 15s
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (!currentLocation || agenda.length === 0) {
      setActiveItem(null);
      setSecondsAtLocation(0);
      return;
    }

    // Buscar si estamos cerca de algún lugar
    const nearby = agenda.find(item => {
      const dist = getDistance(currentLocation.lat, currentLocation.lng, item.lat, item.lng);
      return dist <= RADIUS_METERS;
    });

    if (nearby) {
      if (activeItem?.id !== nearby.id) {
        setActiveItem(nearby);
        setSecondsAtLocation(0);
      }
    } else {
      setActiveItem(null);
      setSecondsAtLocation(0);
    }
  }, [currentLocation, agenda, activeItem?.id]);

  useEffect(() => {
    if (!activeItem) return;

    const timer = setInterval(() => {
      setSecondsAtLocation(prev => {
        const newSecs = prev + 1;
        if (newSecs >= REQUIRED_SECONDS) {
          // Completado!
          clearInterval(timer);
          handleCheckIn(activeItem);
        }
        return newSecs;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeItem]); // eslint-disable-line

  const handleCheckIn = async (item: AgendaItem) => {
    const res = await markAgendaVisitedAndEarnPoints(userId, item.id);
    if (res.success) {
      onPointsEarned(res.newTotalPoints);
      setAgenda(prev => prev.filter(i => i.id !== item.id));
      setActiveItem(null);
      setSecondsAtLocation(0);
      
      // Mostrar celebración
      setShowCelebration({ title: item.place_name, points: 200 });
      setTimeout(() => setShowCelebration(null), 5000);
    }
  };

  // Botón para simular viaje al primer lugar pendiente
  const simulateTravel = () => {
    if (agenda.length > 0) {
      const target = agenda[0];
      setCurrentLocation({ lat: target.lat, lng: target.lng });
    }
  };

  if (showCelebration) {
    return (
      <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[500] animate-bounce">
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 text-black px-6 py-4 rounded-2xl shadow-2xl shadow-amber-500/50 flex items-center gap-4">
          <Trophy className="w-8 h-8" />
          <div>
            <h3 className="font-bold text-lg">¡Check-in Completado!</h3>
            <p className="text-sm font-medium">Has visitado {showCelebration.title}</p>
          </div>
          <div className="text-2xl font-black bg-black/10 px-3 py-1 rounded-lg">
            +{showCelebration.points} pts
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-6 left-6 z-[400] flex flex-col gap-2">
      {activeItem && (
        <div className="bg-zinc-900 border border-purple-500/30 px-4 py-3 rounded-2xl shadow-lg flex items-center gap-3 w-64 animate-pulse">
          <MapPin className="w-6 h-6 text-purple-400" />
          <div className="flex-1">
            <p className="text-xs text-purple-300 font-bold uppercase tracking-wider">Llegando a</p>
            <p className="text-sm text-white font-medium truncate">{activeItem.place_name}</p>
            {/* Barra de progreso */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-amber-400 transition-all duration-1000 ease-linear" 
                style={{ width: `${(secondsAtLocation / REQUIRED_SECONDS) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default LocationTracker;
