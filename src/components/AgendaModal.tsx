import React, { useEffect, useState, useMemo } from 'react';
import { X, MapPin, Loader2, ChevronLeft, ChevronRight, CheckCircle2, Clock, Trophy } from 'lucide-react';
import { getUserAgenda, markAgendaVisitedAndEarnPoints } from '../services/gamification';
import type { AgendaItem } from '../services/gamification';

interface AgendaModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onPointsUpdated?: (newPoints: number) => void;
}

const DAYS_OF_WEEK = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const AgendaModal: React.FC<AgendaModalProps> = ({ isOpen, onClose, userId, onPointsUpdated }) => {
  const [items, setItems] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [celebration, setCelebration] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      getUserAgenda(userId).then(data => {
        setItems(data);
        setLoading(false);
      });
    }
  }, [isOpen, userId]);

  // Agrupar items por fecha
  const itemsByDate = useMemo(() => {
    const map: Record<string, AgendaItem[]> = {};
    items.forEach(item => {
      const key = item.visit_date || 'sin-fecha';
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [items]);

  // Items sin fecha
  const unscheduled = itemsByDate['sin-fecha'] || [];

  // Generar grid del calendario
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // getDay() da 0=Dom, necesitamos 0=Lun
    let startWeekday = firstDay.getDay() - 1;
    if (startWeekday < 0) startWeekday = 6;

    const cells: (number | null)[] = [];
    // Días vacíos antes
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    // Días del mes
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [currentMonth, currentYear]);

  // Saber qué días tienen items
  const daysWithItems = useMemo(() => {
    const set = new Set<number>();
    items.forEach(item => {
      if (!item.visit_date) return;
      const d = new Date(item.visit_date + 'T00:00:00');
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        set.add(d.getDate());
      }
    });
    return set;
  }, [items, currentMonth, currentYear]);

  // Items del día seleccionado
  const selectedDateStr = selectedDay 
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedItems = selectedDateStr ? (itemsByDate[selectedDateStr] || []) : [];

  const handleMarkVisited = async (item: AgendaItem) => {
    setMarkingId(item.id);
    const res = await markAgendaVisitedAndEarnPoints(userId, item.id);
    if (res.success) {
      // Actualizar localmente
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, status: 'visited' } : i));
      onPointsUpdated?.(res.newTotalPoints);
      setCelebration(item.place_name);
      setTimeout(() => setCelebration(null), 3000);
    }
    setMarkingId(null);
  };

  const prevMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const today = new Date();
  const isToday = (day: number) => 
    day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-800/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" /> Mi Agenda de Viaje
          </h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Celebration */}
        {celebration && (
          <div className="mx-4 mt-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl flex items-center gap-3 animate-pulse">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <p className="font-bold text-sm">¡Visita completada!</p>
              <p className="text-xs">{celebration} — +200 pts ganados</p>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto custom-scrollbar flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-purple-500" />
              <p>Cargando tu agenda...</p>
            </div>
          ) : (
            <>
              {/* Navegación del mes y año */}
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-base">
                    {MONTH_NAMES[currentMonth]}
                  </h3>
                  <select
                    value={currentYear}
                    onChange={(e) => { setCurrentYear(Number(e.target.value)); setSelectedDay(null); }}
                    className="bg-zinc-800 border border-white/10 text-white text-sm px-2 py-1 rounded-lg focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <button onClick={nextMonth} className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Grid del calendario */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Headers */}
                {DAYS_OF_WEEK.map(d => (
                  <div key={d} className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider py-1">
                    {d}
                  </div>
                ))}
                {/* Celdas */}
                {calendarDays.map((day, idx) => (
                  <button
                    key={idx}
                    disabled={day === null}
                    onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                    className={`relative aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                      ${day === null ? 'cursor-default' : 'hover:bg-zinc-800 cursor-pointer'}
                      ${day && selectedDay === day ? 'bg-purple-600 text-white ring-2 ring-purple-400' : ''}
                      ${day && isToday(day) && selectedDay !== day ? 'bg-zinc-800 text-amber-400 font-bold' : ''}
                      ${day && !isToday(day) && selectedDay !== day ? 'text-zinc-300' : ''}
                    `}
                  >
                    {day}
                    {/* Indicador de que tiene items */}
                    {day && daysWithItems.has(day) && (
                      <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${selectedDay === day ? 'bg-white' : 'bg-amber-400'}`}></span>
                    )}
                  </button>
                ))}
              </div>

              {/* Lista de items del día seleccionado */}
              {selectedDay && (
                <div className="border-t border-white/10 pt-3 space-y-2">
                  <h4 className="text-sm font-bold text-zinc-400 mb-2">
                    📅 {selectedDay} de {MONTH_NAMES[currentMonth]}
                  </h4>
                  {selectedItems.length === 0 ? (
                    <p className="text-xs text-zinc-500 text-center py-4">No hay actividades este día.</p>
                  ) : (
                    selectedItems.map(item => (
                      <div key={item.id} className="bg-zinc-800/50 border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-zinc-100 text-sm truncate">{item.place_name}</h5>
                          <div className="flex items-center gap-2 mt-1">
                            {item.status === 'visited' ? (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Visitado
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md">
                                Pendiente
                              </span>
                            )}
                          </div>
                        </div>
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleMarkVisited(item)}
                            disabled={markingId === item.id}
                            className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            {markingId === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            Visitado
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Items sin fecha */}
              {unscheduled.length > 0 && (
                <div className="border-t border-white/10 pt-3 mt-3">
                  <h4 className="text-sm font-bold text-zinc-500 mb-2 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Sin fecha asignada
                  </h4>
                  <div className="space-y-2">
                    {unscheduled.map(item => (
                      <div key={item.id} className="bg-zinc-800/30 border border-white/5 p-3 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-zinc-300 text-sm truncate">{item.place_name}</h5>
                          {item.status === 'visited' ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md inline-flex items-center gap-1 mt-1">
                              <CheckCircle2 className="w-3 h-3" /> Visitado
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded-md inline-block mt-1">
                              Pendiente
                            </span>
                          )}
                        </div>
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleMarkVisited(item)}
                            disabled={markingId === item.id}
                            className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            {markingId === item.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3 h-3" />
                            )}
                            Visitado
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estado vacío */}
              {items.length === 0 && (
                <div className="text-center py-8 px-4 text-zinc-400">
                  <p>Aún no has guardado ningún lugar.</p>
                  <p className="text-sm mt-2 text-zinc-500">Haz clic en un pin del mapa para añadir destinos.</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgendaModal;
