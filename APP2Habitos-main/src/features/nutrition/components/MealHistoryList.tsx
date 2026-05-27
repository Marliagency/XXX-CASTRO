import { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { fmt } from '../../../shared/utils/fmt';
import { useNutritionStore } from '../store/nutritionStore';
import { useMealHistory } from '../hooks/useMealHistory';
import { useToast } from '../../../shared/components/ui';
import { sumMacros } from '../types';
import type { Meal, MealEntry } from '../types';
import type { MealHistoryFilter } from '../hooks/useMealHistory';

const MEAL_EMOJI: Record<Meal['type'], string> = {
  breakfast: '🥣',
  lunch:     '🥗',
  dinner:    '🍽️',
  snack:     '🍫',
};

const MEAL_LABEL: Record<Meal['type'], string> = {
  breakfast: 'Desayuno',
  lunch:     'Comida',
  dinner:    'Cena',
  snack:     'Snack',
};

const SOURCE_LABEL: Record<MealEntry['source'], string> = {
  manual:  'Manual',
  ai:      'IA',
  barcode: 'Código',
  voice:   'Voz',
};

function MealHistoryCard({ meal, onReLog }: {
  meal: Meal & { totalCalories: number; totalProtein: number };
  onReLog: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const totals = sumMacros(meal.entries);

  return (
    <div className="border-b border-[var(--border-subtle)] last:border-0">
      {/* Main row */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--bg-hover)] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div
          className="w-9 h-9 rounded-[var(--r-md)] flex items-center justify-center text-xl shrink-0"
          style={{ background: 'var(--c-nutrition)18' }}
        >
          {MEAL_EMOJI[meal.type]}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-[var(--text-primary)] truncate">
              {MEAL_LABEL[meal.type]}
            </p>
            <span className="text-xs font-semibold text-[var(--text-secondary)] shrink-0">
              {fmt(meal.totalCalories, { integer: true })} kcal
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-[var(--accent)]">P {fmt(totals.protein, { decimals: 1 })}g</span>
            <span className="text-[10px] text-[var(--warning)]">C {fmt(totals.carbs, { decimals: 1 })}g</span>
            <span className="text-[10px] text-[var(--journal-color)]">G {fmt(totals.fat, { decimals: 1 })}g</span>
            <span className="text-[10px] text-[var(--text-tertiary)]">· {meal.entries.length} alimentos</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onReLog(); }}
            className="flex items-center gap-1 px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent)]/20 transition-colors"
          >
            <RotateCcw size={10} />
            Añadir
          </button>
          {expanded ? <ChevronUp size={14} className="text-[var(--text-tertiary)]" /> : <ChevronDown size={14} className="text-[var(--text-tertiary)]" />}
        </div>
      </button>

      {/* Expanded items */}
      {expanded && (
        <div className="pl-16 pr-4 pb-3 space-y-1">
          {meal.entries.map(entry => (
            <div key={entry.id} className="flex items-center justify-between gap-2">
              <span className="text-xs text-[var(--text-secondary)] truncate flex-1">
                {entry.name}
                <span className="text-[var(--text-tertiary)] ml-1">
                  · {fmt(entry.quantity, { decimals: 0 })} {entry.serving}
                </span>
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-[var(--text-tertiary)]">
                  {fmt(entry.macros.calories, { integer: true })} kcal
                </span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-[var(--bg-hover)] text-[var(--text-tertiary)]">
                  {SOURCE_LABEL[entry.source]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function MealHistoryList() {
  const [filter, setFilter] = useState<MealHistoryFilter>('week');
  const [tab, setTab]       = useState<'timeline' | 'frequent'>('timeline');
  const { grouped, frequent, total } = useMealHistory(filter);
  const { logMealFromHistory } = useNutritionStore();
  const { toast } = useToast();

  const handleReLog = async (meal: Meal) => {
    await logMealFromHistory(meal);
    toast(`${MEAL_LABEL[meal.type]} añadido para hoy`, 'success');
  };

  const filterLabels: Record<MealHistoryFilter, string> = {
    week: '7d', month: '30d', all: 'Todo',
  };
  const filters: MealHistoryFilter[] = ['week', 'month', 'all'];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">
          Historial de comidas
        </p>
        <div className="flex bg-[var(--bg-hover)] rounded-[var(--r-md)] p-0.5 gap-0.5">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-2 py-0.5 text-[10px] font-medium rounded-[var(--r-sm)] transition-colors"
              style={{
                background: filter === f ? 'var(--bg-surface)' : 'transparent',
                color: filter === f ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex bg-[var(--bg-hover)] rounded-[var(--r-md)] p-0.5 gap-0.5">
        {(['timeline', 'frequent'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-1 text-xs font-medium rounded-[var(--r-sm)] transition-colors"
            style={{
              background: tab === t ? 'var(--bg-surface)' : 'transparent',
              color: tab === t ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}
          >
            {t === 'timeline' ? 'Cronológico' : 'Más repetidas'}
          </button>
        ))}
      </div>

      {tab === 'timeline' ? (
        total === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">
            Sin comidas en este periodo
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.date}>
              <div className="flex items-center justify-between px-1 mb-1">
                <p className="text-xs font-semibold text-[var(--text-secondary)] capitalize">{group.label}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">
                  {fmt(group.totalCalories, { integer: true })} kcal total
                </p>
              </div>
              <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] overflow-hidden">
                {group.meals.map(meal => (
                  <MealHistoryCard
                    key={meal.id}
                    meal={meal}
                    onReLog={() => handleReLog(meal)}
                  />
                ))}
              </div>
            </div>
          ))
        )
      ) : (
        frequent.length === 0 ? (
          <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">
            Sin historial suficiente aún
          </div>
        ) : (
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] overflow-hidden">
            {frequent.map(({ meal, count }) => (
              <div key={meal.id} className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] last:border-0">
                <span className="text-xl shrink-0">{MEAL_EMOJI[meal.type]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                    {MEAL_LABEL[meal.type]}
                  </p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">
                    {meal.entries.map(e => e.name).join(', ').slice(0, 50)}
                    {count > 1 && <span className="ml-1 text-[var(--accent)]">× {count}</span>}
                  </p>
                </div>
                <button
                  onClick={() => handleReLog(meal)}
                  className="flex items-center gap-1 px-2 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent)]/20 transition-colors shrink-0"
                >
                  <RotateCcw size={10} />
                  Añadir
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
