import { useState, useMemo } from 'react';
import { Camera, ScanLine, PenLine, Search, X } from 'lucide-react';
import { useNutritionStore } from '../store/nutritionStore';
import { useToast } from '../../../shared/components/ui';
import { PhotoAnalyzer } from './PhotoAnalyzer';
import { BarcodeScanner } from './BarcodeScanner';
import { ManualFoodForm } from './ManualFoodForm';
import { scaleMacros, MEAL_LABELS } from '../types';
import type { Meal, MealEntry } from '../types';
import { fmt } from '../../../shared/utils/fmt';

type Mode = 'main' | 'photo' | 'barcode' | 'manual';

interface AddFoodSheetProps {
  open: boolean;
  onClose: () => void;
  mealId: string;
  mealType: Meal['type'];
  date: string;
}

export function AddFoodSheet({ open, onClose, mealId, mealType, date }: AddFoodSheetProps) {
  const [mode, setMode] = useState<Mode>('main');
  const [search, setSearch] = useState('');
  const store = useNutritionStore();
  const { toast } = useToast();

  const libraryResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase().trim();
    return store.foods
      .filter(f => f.name.toLowerCase().includes(q) || f.brand?.toLowerCase().includes(q))
      .slice(0, 6);
  }, [search, store.foods]);

  const recentFoods = useMemo(() => {
    const q = search.toLowerCase().trim();
    const seen = new Set<string>();
    const results: MealEntry[] = [];
    const sorted = [...store.meals]
      .filter(m => m.date < date && m.type === mealType)
      .sort((a, b) => b.date.localeCompare(a.date));
    for (const meal of sorted) {
      for (const entry of meal.entries) {
        const key = entry.name.toLowerCase().trim();
        if (!seen.has(key) && entry.macros.calories > 0) {
          if (!q || key.includes(q)) {
            seen.add(key);
            results.push(entry);
          }
        }
        if (results.length >= 10) break;
      }
      if (results.length >= 10) break;
    }
    return results;
  }, [search, store.meals, mealType, date]);

  const handleAddFromEntry = async (entry: MealEntry) => {
    const newEntry: Omit<MealEntry, 'id' | 'addedAt'> = {
      foodItemId: entry.foodItemId,
      name: entry.name,
      quantity: entry.quantity,
      serving: entry.serving,
      macros: scaleMacros(entry.macros, 1),
      source: entry.source,
    };
    await store.addEntryToMeal(mealId, newEntry);
    toast(`${entry.name} añadido`, 'success');
    handleClose();
  };

  const handleAddFromLibrary = async (food: typeof store.foods[number]) => {
    const newEntry: Omit<MealEntry, 'id' | 'addedAt'> = {
      foodItemId: food.id,
      name: food.name,
      quantity: 1,
      serving: food.serving,
      macros: food.macros,
      source: food.source,
    };
    await store.addEntryToMeal(mealId, newEntry);
    toast(`${food.name} añadido`, 'success');
    handleClose();
  };

  const handleClose = () => {
    setMode('main');
    setSearch('');
    onClose();
  };

  const handleBack = () => {
    setMode('main');
  };

  if (!open) return null;

  const subHeader = (title: string) => (
    <div className="flex items-center gap-3 mb-4">
      <button onClick={handleBack} className="text-[var(--accent)] text-sm font-medium shrink-0">
        ← Volver
      </button>
      <span className="flex-1 text-sm font-semibold text-center text-[var(--text-primary)]">{title}</span>
      <button onClick={handleClose} className="shrink-0">
        <X size={16} className="text-[var(--text-tertiary)]" />
      </button>
    </div>
  );

  const sheetWrap = (children: React.ReactNode) => (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="w-full bg-[var(--bg-surface)] rounded-t-[var(--r-2xl)] p-4 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );

  if (mode === 'photo')   return sheetWrap(<>{subHeader('Foto con IA')}<PhotoAnalyzer mealType={mealType} onDone={handleClose} /></>);
  if (mode === 'barcode') return sheetWrap(<>{subHeader('Código de barras')}<BarcodeScanner mealType={mealType} onDone={handleClose} /></>);
  if (mode === 'manual')  return sheetWrap(<>{subHeader('Añadir manual')}<ManualFoodForm mealType={mealType} date={date} onDone={handleClose} /></>);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end" onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="w-full bg-[var(--bg-surface)] rounded-t-[var(--r-2xl)] max-h-[90vh] flex flex-col">
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-[var(--border-default)]" />
        </div>

        <div className="flex items-center px-4 py-3 border-b border-[var(--border-subtle)] shrink-0">
          <span className="flex-1 text-sm font-semibold text-[var(--text-primary)]">
            Añadir a {MEAL_LABELS[mealType]}
          </span>
          <button onClick={handleClose} className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--bg-base)]">
            <X size={14} className="text-[var(--text-tertiary)]" />
          </button>
        </div>

        <div className="px-4 py-3 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              placeholder="Buscar alimento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-3 py-2 rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {([
              { m: 'photo'   as Mode, Icon: Camera,   label: 'Foto IA' },
              { m: 'barcode' as Mode, Icon: ScanLine,  label: 'Código'  },
              { m: 'manual'  as Mode, Icon: PenLine,   label: 'Manual'  },
            ]).map(({ m, Icon, label }) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="flex flex-col items-center gap-1.5 py-3 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] hover:border-[var(--nutrition-color)] hover:bg-[var(--bg-hover)] transition-all"
              >
                <Icon size={18} className="text-[var(--text-secondary)]" />
                <span className="text-[10px] text-[var(--text-tertiary)]">{label}</span>
              </button>
            ))}
          </div>

          {libraryResults.length > 0 && (
            <div>
              <p className="text-[9px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Biblioteca</p>
              <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] overflow-hidden">
                {libraryResults.map(food => (
                  <button
                    key={food.id}
                    onClick={() => handleAddFromLibrary(food)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-hover)] transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{food.name}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">
                        {fmt(food.macros.calories, { integer: true })} kcal · {food.serving}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[var(--accent)] shrink-0">+</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {recentFoods.length > 0 && (
            <div>
              <p className="text-[9px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                {search.trim() ? 'Historial' : 'Usados recientemente'}
              </p>
              <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] overflow-hidden">
                {recentFoods.map((entry, i) => (
                  <button
                    key={i}
                    onClick={() => handleAddFromEntry(entry)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-hover)] transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{entry.name}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)]">
                        {fmt(entry.macros.calories, { integer: true })} kcal
                        {entry.quantity !== 1 ? ` · ${entry.quantity}×` : ''} · {entry.serving}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[var(--accent)] shrink-0">+</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {search.trim().length > 0 && libraryResults.length === 0 && recentFoods.length === 0 && (
            <div className="text-center py-8 space-y-2">
              <p className="text-sm text-[var(--text-tertiary)]">Sin resultados para "{search}"</p>
              <button onClick={() => setMode('manual')} className="text-xs text-[var(--accent)]">
                Añadir manualmente →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
