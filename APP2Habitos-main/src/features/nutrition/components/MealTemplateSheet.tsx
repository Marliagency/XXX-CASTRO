import { useState, useMemo } from 'react';
import { ChefHat, Search, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { useNutritionStore } from '../store/nutritionStore';
import { MEAL_TEMPLATES, GOAL_TEMPLATE_LABELS, MEAL_TYPE_LABELS } from '../templates/mealTemplates';
import type { MealTemplate } from '../templates/mealTemplates';
import type { Macros, Meal } from '../types';
import { useToast } from '../../../shared/components/ui';

interface MealTemplateSheetProps {
  open:     boolean;
  onClose:  () => void;
  date:     string;
  mealType: Meal['type'];
}

const GOAL_FILTERS = ['muscle', 'fat_loss', 'balanced', 'performance', 'vegetarian'] as const;

function MacroBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-bold" style={{ color }}>{value}g</p>
      <p className="text-[9px] text-[var(--text-tertiary)]">{label}</p>
    </div>
  );
}

function TemplateCard({
  template,
  onUse,
}: { template: MealTemplate; onUse: (t: MealTemplate) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] overflow-hidden">
      <div
        className="p-3.5 cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)]">{template.name}</p>
            {template.description && (
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">{template.description}</p>
            )}
          </div>
          <button
            onClick={e => { e.stopPropagation(); onUse(template); }}
            aria-label={`Usar plantilla ${template.name}`}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--accent)] text-white rounded-[var(--r-md)] text-xs font-medium shrink-0 hover:opacity-90 transition-opacity"
          >
            <Zap size={11} />
            Usar
          </button>
        </div>
        <div className="flex items-center gap-4 mt-2.5">
          <div className="text-center">
            <p className="text-sm font-bold text-[var(--text-primary)]">{template.totalCalories}</p>
            <p className="text-[9px] text-[var(--text-tertiary)]">kcal</p>
          </div>
          <div className="w-px h-6 bg-[var(--border-subtle)]" />
          <MacroBadge label="Prot" value={template.totalProtein} color="var(--accent)" />
          <MacroBadge label="Carbs" value={template.totalCarbs}  color="var(--success)" />
          <MacroBadge label="Grasa" value={template.totalFat}    color="var(--warning)" />
          <div className="flex-1" />
          <div className="flex flex-wrap gap-1 justify-end">
            {template.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--bg-base)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Expandable food list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden border-t border-[var(--border-subtle)]"
          >
            <div className="px-3.5 py-3 space-y-2">
              {template.foods.map((food, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-[var(--text-tertiary)] w-5 shrink-0">{food.quantity}{food.serving.startsWith('g') || food.serving.startsWith('ml') ? food.serving : ''}</span>
                  <span className="flex-1 text-[var(--text-secondary)]">{food.name}</span>
                  <span className="text-[var(--text-tertiary)]">{food.calories} kcal</span>
                  <span className="text-[var(--accent)] font-medium">{food.protein}g P</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MealTemplateSheet({ open, onClose, date, mealType }: MealTemplateSheetProps) {
  const { quickAdd }   = useNutritionStore();
  const { toast }      = useToast();
  const [search,       setSearch]       = useState('');
  const [goalFilter,   setGoalFilter]   = useState<MealTemplate['goal'] | 'all'>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return MEAL_TEMPLATES.filter(t => {
      const matchesMeal = t.mealType === 'any' || t.mealType === mealType;
      const matchesGoal = goalFilter === 'all' || t.goal === goalFilter;
      const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.tags.some(tag => tag.includes(q));
      return matchesMeal && matchesGoal && matchesSearch;
    });
  }, [search, goalFilter, mealType]);

  const handleUse = async (template: MealTemplate) => {
    for (const food of template.foods) {
      const macros: Macros = {
        calories: food.calories,
        protein:  food.protein,
        carbs:    food.carbs,
        fat:      food.fat,
        fiber:    undefined,
        sugar:    undefined,
        sodium:   undefined,
      };
      await quickAdd({
        name:     food.name,
        macros,
        quantity: food.quantity,
        serving:  food.serving,
        source:   'manual',
        mealType,
        date,
      });
    }
    toast(`Plantilla "${template.name}" añadida`, 'success');
    onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className="relative w-full max-w-lg bg-[var(--bg-base)] rounded-t-[var(--r-xl)] shadow-xl max-h-[85vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0">
              <div className="w-10 h-1 rounded-full bg-[var(--border-default)]" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <ChefHat size={16} className="text-[var(--accent)]" />
                <p className="text-base font-semibold text-[var(--text-primary)]">
                  Plantillas — {MEAL_TYPE_LABELS[mealType]}
                </p>
              </div>
              <button onClick={onClose} aria-label="Cerrar" className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] transition-colors">
                <X size={15} className="text-[var(--text-tertiary)]" />
              </button>
            </div>

            {/* Filters */}
            <div className="px-4 pb-3 shrink-0 space-y-2">
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Buscar plantilla…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-[var(--r-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {(['all', ...GOAL_FILTERS] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGoalFilter(g)}
                    className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      goalFilter === g
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    {g === 'all' ? 'Todos' : GOAL_TEMPLATE_LABELS[g]}
                  </button>
                ))}
              </div>
            </div>

            {/* Template list */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
              {filtered.length === 0 ? (
                <div className="text-center py-10">
                  <ChefHat size={24} className="mx-auto text-[var(--text-tertiary)] mb-2" />
                  <p className="text-sm text-[var(--text-tertiary)]">Sin plantillas para este filtro</p>
                </div>
              ) : (
                filtered.map(template => (
                  <TemplateCard key={template.id} template={template} onUse={handleUse} />
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
