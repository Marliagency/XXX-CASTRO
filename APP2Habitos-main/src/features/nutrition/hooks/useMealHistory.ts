import { useMemo } from 'react';
import { format, subDays, startOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNutritionStore } from '../store/nutritionStore';
import { sumMacros } from '../types';
import type { Meal } from '../types';

export type MealHistoryFilter = 'week' | 'month' | 'all';

export interface MealHistoryGroup {
  date: string;
  label: string;
  meals: Array<Meal & { totalCalories: number; totalProtein: number }>;
  totalCalories: number;
}

export function useMealHistory(filter: MealHistoryFilter = 'week') {
  const meals = useNutritionStore(s => s.meals);

  const filtered = useMemo(() => {
    const now = new Date();
    const cutoffs: Record<MealHistoryFilter, Date | null> = {
      week:  startOfDay(subDays(now, 7)),
      month: startOfDay(subDays(now, 30)),
      all:   null,
    };
    const cutoff = cutoffs[filter];
    return cutoff
      ? meals.filter(m => new Date(m.date + 'T12:00:00') >= cutoff)
      : meals;
  }, [meals, filter]);

  const grouped = useMemo<MealHistoryGroup[]>(() => {
    const map = new Map<string, Meal[]>();
    for (const meal of filtered) {
      const existing = map.get(meal.date) ?? [];
      map.set(meal.date, [...existing, meal]);
    }

    return [...map.entries()]
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, dayMeals]) => {
        const enriched = dayMeals.map(m => {
          const totals = sumMacros(m.entries);
          return { ...m, totalCalories: totals.calories, totalProtein: totals.protein };
        });
        return {
          date,
          label: formatDateLabel(date),
          meals: enriched.sort((a, b) => a.type.localeCompare(b.type)),
          totalCalories: enriched.reduce((s, m) => s + m.totalCalories, 0),
        };
      });
  }, [filtered]);

  // Top 10 most-repeated meal names (by type+content fingerprint)
  const frequent = useMemo(() => {
    const counts = new Map<string, { meal: Meal; count: number }>();
    for (const meal of meals) {
      const key = `${meal.type}:${meal.entries.map(e => e.name).sort().join(',')}`;
      const existing = counts.get(key);
      if (existing) {
        existing.count++;
      } else {
        counts.set(key, { meal, count: 1 });
      }
    }
    return [...counts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [meals]);

  return { grouped, frequent, total: filtered.length };
}

function formatDateLabel(dateStr: string): string {
  const today     = format(new Date(), 'yyyy-MM-dd');
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  if (dateStr === today)     return 'Hoy';
  if (dateStr === yesterday) return 'Ayer';
  return format(new Date(dateStr + 'T12:00:00'), "EEEE d 'de' MMMM", { locale: es });
}
