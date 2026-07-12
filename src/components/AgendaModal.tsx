import React, { useEffect, useState, useMemo } from 'react';
import { X, MapPin, Loader2, ChevronLeft, ChevronRight, CheckCircle2, Clock, Trophy, List, Calendar as CalendarIcon } from 'lucide-react';
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
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      getUserAgenda(userId).then(data => {
        setItems(data);
        setLoading(false);
      });
    }
  }, [isOpen, userId]);

  const itemsByDate = useMemo(() => {
    const map: Record<string, AgendaItem[]> = {};
    items.forEach(item => {
      const key = item.visit_date || 'sin-fecha';
      if (!map[key]) map[key] = [];
      map[key].push(item);
    });
    return map;
  }, [items]);

  const sortedDates = useMemo(() => {
    return Object.keys(itemsByDate)
      .filter(k => k !== 'sin-fecha')
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  }, [itemsByDate]);

  const unscheduled = itemsByDate['sin-fecha'] || [];

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    let startWeekday = firstDay.getDay() - 1;
    if (startWeekday < 0) startWeekday = 6;

    const cells: (number | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [currentMonth, currentYear]);

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

  const selectedDateStr = selectedDay 
    ? `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`
    : null;
  const selectedItems = selectedDateStr ? (itemsByDate[selectedDateStr] || []) : [];

  const handleMarkVisited = async (item: AgendaItem) => {
    setMarkingId(item.id);
    const res = await markAgendaVisitedAndEarnPoints(userId, item.id);
    if (res.success) {
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
      <div className="bg-zinc-900 border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-zinc-800/50">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" /> Mi Agenda
            </h2>
            <div className="flex bg-zinc-900 rounded-lg p-1 border border-white/5">
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${viewMode === 'calendar' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                <CalendarIcon className="w-3.5 h-3.5" /> Calendario
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                <List className="w-3.5 h-3.5" /> Lista
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {celebration && (
          <div className="mx-4 mt-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 p-3 rounded-xl flex items-center gap-3 animate-pulse">
            <Trophy className="w-6 h-6 text-amber-400" />
            <div>
              <p className="font-bold text-sm">¡Visita completada!</p>
              <p className="text-xs">{celebration} — +200 pts ganados</p>
            </div>
          </div>
        )}

        <div className="p-4 overflow-y-auto custom-scrollbar flex-1 bg-zinc-950">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-purple-500" />
              <p>Cargando tu agenda...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 px-4 text-zinc-400">
              <p>Aún no has guardado ningún lugar.</p>
              <p className="text-sm mt-2 text-zinc-500">Haz clic en un pin del mapa para añadir destinos.</p>
            </div>
          ) : (
            <>
              {viewMode === 'calendar' && (
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Calendar Widget */}
                  <div className="flex-1 md:max-w-sm">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <button onClick={prevMonth} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white">
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-bold text-base">{MONTH_NAMES[currentMonth]}</h3>
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
                        <button onClick={nextMonth} className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS_OF_WEEK.map(d => (
                          <div key={d} className="text-center text-[10px] font-bold text-zinc-500 uppercase tracking-wider py-1">
                            {d}
                          </div>
                        ))}
                        {calendarDays.map((day, idx) => {
                          const hasItems = day && daysWithItems.has(day);
                          const isSelected = day !== null && selectedDay === day;
                          const todayFlag = day && isToday(day);
                          return (
                            <button
                              key={idx}
                              disabled={day === null}
                              onClick={() => day && setSelectedDay(isSelected ? null : day)}
                              className={`relative aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all
                                ${day === null ? 'cursor-default' : 'hover:bg-zinc-800 cursor-pointer border border-transparent'}
                                ${isSelected ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : ''}
                                ${todayFlag && !isSelected ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : ''}
                                ${day && !todayFlag && !isSelected ? 'text-zinc-300' : ''}
                                ${hasItems && !isSelected ? 'bg-purple-500/10' : ''}
                              `}
                            >
                              {day}
                              {hasItems && (
                                <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-purple-500'}`}></span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Day Itinerary */}
                  <div className="flex-1 bg-zinc-900/50 border border-white/5 rounded-xl p-4">
                    {selectedDay ? (
                      <>
                        <h4 className="text-sm font-bold text-amber-500 mb-4 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" /> 
                          {selectedDay} de {MONTH_NAMES[currentMonth]}
                        </h4>
                        
                        {selectedItems.length === 0 ? (
                          <div className="text-center py-12 text-zinc-500 flex flex-col items-center">
                            <Clock className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">Día libre. ¡Pregúntale al Cipitío por recomendaciones!</p>
                          </div>
                        ) : (
                          <div className="relative border-l-2 border-purple-500/30 ml-3 pl-4 space-y-6">
                            {selectedItems.map(item => (
                              <div key={item.id} className="relative">
                                {/* Timeline dot */}
                                <div className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full border-2 border-zinc-900 ${item.status === 'visited' ? 'bg-emerald-500' : 'bg-purple-500'}`}></div>
                                
                                <div className="bg-zinc-800/80 border border-white/5 p-3 rounded-xl">
                                  <h5 className="font-bold text-white text-sm">{item.place_name}</h5>
                                  <div className="flex items-center gap-2 mt-2">
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
                                  
                                  {item.status === 'pending' && (
                                    <button
                                      onClick={() => handleMarkVisited(item)}
                                      disabled={markingId === item.id}
                                      className="mt-3 w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                      {markingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                      Marcar como Visitado (+200 pts)
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-center p-6">
                        <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                        <p>Selecciona un día en el calendario para ver tu itinerario.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {viewMode === 'list' && (
                <div className="space-y-6 max-w-2xl mx-auto w-full">
                  {sortedDates.map(dateStr => {
                    const dateObj = new Date(dateStr + 'T00:00:00');
                    return (
                      <div key={dateStr}>
                        <h4 className="text-sm font-bold text-amber-500 mb-3 border-b border-white/10 pb-1 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          {dateObj.getDate()} de {MONTH_NAMES[dateObj.getMonth()]} {dateObj.getFullYear()}
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {itemsByDate[dateStr].map(item => (
                            <div key={item.id} className="bg-zinc-900 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                              <div className="flex-1">
                                <h5 className="font-bold text-white text-base mb-1">{item.place_name}</h5>
                                {item.status === 'visited' ? (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Visitado
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md inline-flex">
                                    Pendiente
                                  </span>
                                )}
                              </div>
                              {item.status === 'pending' && (
                                <button
                                  onClick={() => handleMarkVisited(item)}
                                  disabled={markingId === item.id}
                                  className="shrink-0 bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                  {markingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                  Marcar Visitado
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  
                  {unscheduled.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-zinc-500 mb-3 border-b border-white/10 pb-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Sin fecha asignada
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        {unscheduled.map(item => (
                          <div key={item.id} className="bg-zinc-800/30 border border-white/5 p-4 rounded-xl flex items-center justify-between gap-4">
                            <div className="flex-1">
                              <h5 className="font-bold text-white text-base mb-1">{item.place_name}</h5>
                              {item.status === 'visited' ? (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Visitado
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-700 text-zinc-400 px-2 py-0.5 rounded-md inline-flex">
                                  Pendiente
                                </span>
                              )}
                            </div>
                            {item.status === 'pending' && (
                              <button
                                onClick={() => handleMarkVisited(item)}
                                disabled={markingId === item.id}
                                className="shrink-0 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {markingId === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                Marcar Visitado
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
