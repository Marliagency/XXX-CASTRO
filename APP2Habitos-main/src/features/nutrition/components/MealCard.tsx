import { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Plus } from 'lucide-react';
import { MacroBadges } from './DailyRings';
import { RecentFoodsBar } from './RecentFoodsBar';
import { AddFoodSheet } from './AddFoodSheet';
import { useNutritionStore } from '../store/nutritionStore';
import { sumMacros, MEAL_LABELS } from '../types';
import type { Meal } from '../types';

interface MealCardProps {
  meal: Meal;
  currentDate: string;
}

export function MealCard({ meal, currentDate }: MealCardProps) {
  const [open, setOpen] = useState(true);
  const [showAddSheet, setShowAddSheet] = useState(false);
  const { removeEntry, deleteMeal } = useNutritionStore();
  const totals = sumMacros(meal.entries);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] overflow-hidden">
      {/* Meal header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-[var(--text-primary)]">{MEAL_LABELS[meal.type]}</p>
          {meal.entries.length > 0 && <MacroBadges macros={totals} size="sm" />}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-tertiary)]">{meal.entries.length} items</span>
          {open ? <ChevronUp size={14} className="text-[var(--text-tertiary)]" /> : <ChevronDown size={14} className="text-[var(--text-tertiary)]" />}
        </div>
      </button>

      {/* Entries */}
      {open && (
        <div className="border-t border-[var(--border-subtle)]">
          {meal.entries.length === 0 ? (
            <p className="px-4 py-3 text-xs text-[var(--text-tertiary)] text-center">Sin alimentos</p>
          ) : (
            <div className="divide-y divide-[var(--border-subtle)]">
              {meal.entries.map(entry => (
                <div key={entry.id} className="flex items-center gap-3 px-4 py-2.5">
                  {entry.photoUri && (
                    <img
                      src={entry.photoUri}
                      alt={entry.name}
                      className="w-9 h-9 rounded-[var(--r-md)] object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">{entry.name}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">
                      {entry.quantity !== 1 ? `${entry.quantity}× ` : ''}{entry.serving}
                    </p>
                  </div>
                  <MacroBadges macros={entry.macros} size="sm" />
                  <button
                    onClick={() => removeEntry(meal.id, entry.id)}
                    className="w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Recent foods for this meal */}
          <RecentFoodsBar mealId={meal.id} mealType={meal.type} currentDate={currentDate} />

          {/* Actions */}
          <div className="flex gap-2 px-3 py-2 border-t border-[var(--border-subtle)]">
            <button
              onClick={() => setShowAddSheet(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--r-md)] transition-colors border border-dashed border-[var(--border-default)]"
            >
              <Plus size={12} /> Añadir alimento
            </button>
            {meal.entries.length === 0 && (
              <button
                onClick={() => deleteMeal(meal.id)}
                className="w-8 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      )}

      <AddFoodSheet
        open={showAddSheet}
        onClose={() => setShowAddSheet(false)}
        mealId={meal.id}
        mealType={meal.type}
        date={currentDate}
      />
    </div>
  );
}

interface QuickAddRowProps {
  name: string;
  macros: { calories: number; protein: number; carbs: number; fat: number };
  confidence?: number;
  quantity: number;
  onQuantityChange: (q: number) => void;
  onRemove: () => void;
}

export function QuickAddRow({ name, macros, confidence, quantity, onQuantityChange, onRemove }: QuickAddRowProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2.5 bg-[var(--bg-base)] rounded-[var(--r-lg)]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-xs font-medium text-[var(--text-primary)] truncate">{name}</p>
          {confidence !== undefined && confidence < 0.7 && (
            <span className="text-[9px] px-1 py-0.5 bg-[var(--warning-subtle)] text-[var(--warning)] rounded">~</span>
          )}
        </div>
        <MacroBadges
          macros={{
            calories: Math.round(macros.calories * quantity),
            protein:  Math.round(macros.protein  * quantity * 10) / 10,
            carbs:    Math.round(macros.carbs    * quantity * 10) / 10,
            fat:      Math.round(macros.fat      * quantity * 10) / 10,
          }}
          size="sm"
        />
      </div>
      {/* Quantity stepper */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onQuantityChange(Math.max(0.25, quantity - 0.25))}
          className="w-6 h-6 rounded-[var(--r-sm)] border border-[var(--border-default)] flex items-center justify-center text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
        >−</button>
        <span className="text-xs w-7 text-center text-[var(--text-primary)] font-medium">{quantity}</span>
        <button
          onClick={() => onQuantityChange(quantity + 0.25)}
          className="w-6 h-6 rounded-[var(--r-sm)] border border-[var(--border-default)] flex items-center justify-center text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
        >+</button>
      </div>
      <button onClick={onRemove} className="w-6 h-6 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)]">
        <Trash2 size={12} />
      </button>
    </div>
  );
}
