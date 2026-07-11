import React, { useEffect, useState } from 'react';
import { X, MapPin, Loader2 } from 'lucide-react';
import { getUserAgenda, AgendaItem } from '../services/gamification';

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const AgendaModal: React.FC<AgendaModalProps> = ({ isOpen, onClose, userId }) => {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      getUserAgenda(userId).then(data => {
        setItems(data);
        setLoading(false);
      });
    }
  }, [isOpen, userId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" /> Mi Agenda de Viaje
          </h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-purple-500" />
              <p>Cargando tu agenda...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 px-4 text-zinc-400">
              <p>Aún no has guardado ningún lugar.</p>
              <p className="text-sm mt-2 text-zinc-500">Pídele recomendaciones al Cipitío y guárdalas para ganar puntos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="bg-zinc-800/40 border border-white/5 p-4 rounded-xl flex items-start justify-between group hover:border-purple-500/30 transition-colors">
                  <div>
                    <h3 className="font-bold text-zinc-100">{item.place_name}</h3>
                    <p className="text-xs text-zinc-500 mt-1">
                      Lat: {item.lat.toFixed(4)} | Lng: {item.lng.toFixed(4)}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-400 px-2 py-1 rounded-md">
                    Guardado
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AgendaModal;
