import React, { useState } from 'react';
import { Tent, Mountain, Utensils, Landmark, Church, Waves, X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { saveUserPreferences } from '../services/userPreferences';

interface OnboardingSurveyProps {
  userId: string;
  onComplete: () => void;
}

const CATEGORIES = [
  { id: 'aventura', label: 'Aventura', icon: Tent, color: 'amber' },
  { id: 'naturaleza', label: 'Naturaleza', icon: Mountain, color: 'green' },
  { id: 'gastronomía', label: 'Gastronomía', icon: Utensils, color: 'orange' },
  { id: 'cultura', label: 'Cultura', icon: Landmark, color: 'blue' },
  { id: 'religioso', label: 'Religioso', icon: Church, color: 'indigo' },
  { id: 'deportes', label: 'Deportes', icon: Waves, color: 'cyan' },
];

const BUDGETS = [
  { id: 'free', label: 'Gratis', emoji: '🆓' },
  { id: '1-20', label: '$1 – $20', emoji: '💵' },
  { id: '20-50', label: '$20 – $50', emoji: '💰' },
  { id: '50+', label: '$50+', emoji: '💎' },
];

const DURATIONS = [
  { id: '1-day', label: '1 día', emoji: '⚡' },
  { id: '2-3-days', label: '2–3 días', emoji: '🗓️' },
  { id: '4-7-days', label: '4–7 días', emoji: '🧳' },
  { id: '1-week+', label: 'Más de una semana', emoji: '🏖️' },
  { id: 'local', label: 'Soy local', emoji: '🏠' },
];

const colorMap: Record<string, string> = {
  amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  green: 'border-green-500/30 bg-green-500/10 text-green-400',
  orange: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  indigo: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
  cyan: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
};

const colorMapSelected: Record<string, string> = {
  amber: 'border-amber-400 bg-amber-500/25 text-amber-300 ring-2 ring-amber-500/40',
  green: 'border-green-400 bg-green-500/25 text-green-300 ring-2 ring-green-500/40',
  orange: 'border-orange-400 bg-orange-500/25 text-orange-300 ring-2 ring-orange-500/40',
  blue: 'border-blue-400 bg-blue-500/25 text-blue-300 ring-2 ring-blue-500/40',
  indigo: 'border-indigo-400 bg-indigo-500/25 text-indigo-300 ring-2 ring-indigo-500/40',
  cyan: 'border-cyan-400 bg-cyan-500/25 text-cyan-300 ring-2 ring-cyan-500/40',
};

const OnboardingSurvey: React.FC<OnboardingSurveyProps> = ({ userId, onComplete }) => {
  const [step, setStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const totalSteps = 3;

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleFinish = async () => {
    setIsSaving(true);
    try {
      await saveUserPreferences(userId, {
        preferred_categories: selectedCategories,
        budget_range: selectedBudget || 'any',
        trip_duration: selectedDuration || 'any',
      });
    } catch (e) {
      console.error('Error saving preferences:', e);
    }
    setIsSaving(false);
    onComplete();
  };

  const handleSkip = () => {
    onComplete();
  };

  const canGoNext = () => {
    if (step === 0) return selectedCategories.length > 0;
    if (step === 1) return !!selectedBudget;
    if (step === 2) return !!selectedDuration;
    return true;
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-zinc-950/90 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-zinc-900/95 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-sm font-bold text-white">Personaliza tu experiencia</span>
          </div>
          <button onClick={handleSkip} className="text-zinc-500 hover:text-white transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                  i <= step ? 'bg-purple-500' : 'bg-white/10'
                }`}
              />
            ))}
          </div>
          <p className="text-zinc-500 text-xs mt-2">Paso {step + 1} de {totalSteps}</p>
        </div>

        {/* Content */}
        <div className="p-6 min-h-[320px] flex flex-col">
          
          {/* Step 0: Categories */}
          {step === 0 && (
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">¿Qué tipo de experiencias prefieres?</h2>
              <p className="text-zinc-400 text-sm mb-6">Selecciona todas las que te interesen.</p>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategory(cat.id)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                        isSelected ? colorMapSelected[cat.color] : colorMap[cat.color]
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm font-semibold">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Budget */}
          {step === 1 && (
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">¿Cuál es tu presupuesto aproximado?</h2>
              <p className="text-zinc-400 text-sm mb-6">Así te recomendaremos lugares acorde a tu bolsillo.</p>
              <div className="grid grid-cols-2 gap-3">
                {BUDGETS.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBudget(b.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.02] active:scale-95 ${
                      selectedBudget === b.id
                        ? 'border-purple-400 bg-purple-500/20 text-purple-300 ring-2 ring-purple-500/40'
                        : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl">{b.emoji}</span>
                    <span className="text-sm font-semibold">{b.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Duration */}
          {step === 2 && (
            <div className="flex-1">
              <h2 className="text-xl font-bold text-white mb-2">¿Cuánto tiempo estarás de visita?</h2>
              <p className="text-zinc-400 text-sm mb-6">Te armaremos un itinerario perfecto para tu estadía.</p>
              <div className="flex flex-col gap-3">
                {DURATIONS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDuration(d.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] ${
                      selectedDuration === d.id
                        ? 'border-purple-400 bg-purple-500/20 text-purple-300 ring-2 ring-purple-500/40'
                        : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20'
                    }`}
                  >
                    <span className="text-xl">{d.emoji}</span>
                    <span className="text-sm font-semibold">{d.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-6 pt-0 flex items-center justify-between">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm font-medium transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
          ) : (
            <button
              onClick={handleSkip}
              className="text-zinc-500 hover:text-zinc-300 text-sm font-medium transition-colors"
            >
              Omitir
            </button>
          )}

          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canGoNext()}
              className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              disabled={!canGoNext() || isSaving}
              className="flex items-center gap-1 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
            >
              {isSaving ? 'Guardando...' : 'Finalizar'} <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingSurvey;
