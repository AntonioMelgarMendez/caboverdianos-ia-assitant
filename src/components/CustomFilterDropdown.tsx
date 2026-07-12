import React, { useState, useRef, useEffect } from 'react';
import { Filter, Check, Mountain, Palmtree, Utensils, BookOpen, Church, MapPin } from 'lucide-react';

interface CategoryOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

export const CATEGORIES: CategoryOption[] = [
  { id: 'deportes', label: 'Playas y Deportes', icon: <Palmtree className="w-4 h-4" />, color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30' },
  { id: 'aventura', label: 'Montañas y Aventura', icon: <Mountain className="w-4 h-4" />, color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30' },
  { id: 'naturaleza', label: 'Parques y Reservas', icon: <MapPin className="w-4 h-4" />, color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  { id: 'cultura', label: 'Cultura e Historia', icon: <BookOpen className="w-4 h-4" />, color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' },
  { id: 'gastronomía', label: 'Gastronomía', icon: <Utensils className="w-4 h-4" />, color: 'text-orange-400 bg-orange-400/10 border-orange-400/30' },
  { id: 'religioso', label: 'Turismo Religioso', icon: <Church className="w-4 h-4" />, color: 'text-purple-400 bg-purple-400/10 border-purple-400/30' }
];

interface CustomFilterDropdownProps {
  selectedCategories: string[];
  onChangeCategories: (categories: string[]) => void;
  maxPrice: number;
  onChangeMaxPrice: (price: number) => void;
}

const CustomFilterDropdown: React.FC<CustomFilterDropdownProps> = ({
  selectedCategories,
  onChangeCategories,
  maxPrice,
  onChangeMaxPrice
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onChangeCategories(selectedCategories.filter(id => id !== categoryId));
    } else {
      onChangeCategories([...selectedCategories, categoryId]);
    }
  };

  const getFilterLabel = () => {
    if (selectedCategories.length === 0) return 'Todos los lugares';
    if (selectedCategories.length === 1) {
      return CATEGORIES.find(c => c.id === selectedCategories[0])?.label || 'Filtrado';
    }
    return `${selectedCategories.length} filtros`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all ${
          isOpen || selectedCategories.length > 0 
            ? 'bg-purple-600/20 border-purple-500/50 text-white' 
            : 'bg-zinc-800/50 border-white/10 text-zinc-300 hover:bg-zinc-800 hover:text-white'
        }`}
      >
        <Filter className={`w-4 h-4 ${selectedCategories.length > 0 ? 'text-purple-400' : 'text-zinc-400'}`} />
        {getFilterLabel()}
        {maxPrice < 1000 && <span className="ml-1 text-amber-400 border-l border-white/20 pl-2">≤ ${maxPrice}</span>}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-80 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden left-0 md:left-1/2 md:-translate-x-1/2">
          <div className="p-4 border-b border-white/10 bg-zinc-800/30">
            <h3 className="text-sm font-bold text-white mb-3">Categorías</h3>
            <div className="grid grid-cols-2 gap-2">
              {CATEGORIES.map(category => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs font-medium border transition-all text-left ${
                      isSelected 
                        ? category.color 
                        : 'text-zinc-400 bg-zinc-800/50 border-white/5 hover:bg-zinc-800 hover:text-zinc-200 hover:border-white/20'
                    }`}
                  >
                    <div className="shrink-0">{category.icon}</div>
                    <span className="truncate leading-tight flex-1">{category.label}</span>
                    {isSelected && <Check className="w-3 h-3 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="p-4 bg-zinc-950/50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-white">Precio Máximo</h3>
              <span className="text-amber-500 font-bold text-sm">${maxPrice}</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1000" 
              step="10"
              value={maxPrice}
              onChange={(e) => onChangeMaxPrice(Number(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer hover:accent-amber-400 transition-colors"
            />
            <div className="flex justify-between text-[10px] font-bold text-zinc-500 mt-2 uppercase">
              <span>Gratis</span>
              <span>Sin límite</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomFilterDropdown;
