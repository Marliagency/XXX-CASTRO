import { useMemo } from 'react';
import { subDays, format } from 'date-fns';
import { RotateCcw } from 'lucide-react';
import { useNutritionStore } from '../store/nutritionStore';
import { useToast } from '../../../shared/components/ui';
import { fmt } from '../../../shared/utils/fmt';
import type { Meal, MealEntry } from '../types';
import { scaleMacros } from '../types';

interface RecentFoodsBarProps {
  mealId: string;
  mealType: Meal['type'];
  currentDate: string;
}

interface RecentFood {
  name: string;
  entry: MealEntry;
}

export function RecentFoodsBar({ mealId, mealType, currentDate }: RecentFoodsBarProps) {
  const store = useNutritionStore();
  const { toast } = useToast();

  const recentFoods = useMemo<RecentFood[]>(() => {
    const cutoff = format(subDays(new Date(), 21), 'yyyy-MM-dd');
    const seen = new Set<string>();
    const results: RecentFood[] = [];

    const pastMeals = [...store.meals]
      .filter(m => m.date >= cutoff && m.date < currentDate && m.type === mealType)
      .sort((a, b) => b.date.localeCompare(a.date));

    for (const meal of pastMeals) {
      for (const entry of meal.entries) {
        const key = entry.name.toLowerCase().trim();
        if (!seen.has(key) && entry.macros.calories > 0) {
          seen.add(key);
          results.push({ name: entry.name, entry });
        }
        if (results.length >= 8) break;
      }
      if (results.length >= 8) break;
    }
    return results;
  }, [store.meals, mealType, currentDate]);

  if (recentFoods.length === 0) return null;

  const handleAdd = async (food: RecentFood) => {
    const entry: Omit<MealEntry, 'id' | 'addedAt'> = {
      foodItemId: food.entry.foodItemId,
      name:       food.entry.name,
      quantity:   food.entry.quantity,
      serving:    food.entry.serving,
      macros:     scaleMacros(food.entry.macros, 1),
      source:     food.entry.source,
    };
    await store.addEntryToMeal(mealId, entry);
    toast(`${food.name} añadido`, 'success');
  };

  return (
    <div className="px-3 py-2 border-t border-[var(--border-subtle)] space-y-1.5">
      <div className="flex items-center gap-1">
        <RotateCcw size={9} className="text-[var(--text-tertiary)]" />
        <span className="text-[9px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Recientes</span>
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
        {recentFoods.map((food, i) => (
          <button
            key={i}
            onClick={() => handleAdd(food)}
            className="flex-none flex flex-col gap-0.5 px-2.5 py-1.5 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--r-md)] hover:border-[var(--nutrition-color)] hover:bg-[var(--bg-hover)] transition-all text-left max-w-[110px]"
          >
            <span className="text-[10px] font-medium text-[var(--text-primary)] leading-tight line-clamp-1">{food.name}</span>
            <span className="text-[9px] text-[var(--text-tertiary)] tabular-nums">
              {fmt(food.entry.macros.calories, { integer: true })} kcal
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
