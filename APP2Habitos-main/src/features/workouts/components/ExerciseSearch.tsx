import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import clsx from 'clsx';
import type { Exercise, MuscleGroup } from '../types';
import { MUSCLE_GROUP_LABELS } from '../types';
import { Input } from '../../../shared/components/ui';

interface ExerciseSearchProps {
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<Exercise['category'], string> = {
  compound:   'Compuesto',
  isolation:  'Aislamiento',
  cardio:     'Cardio',
  mobility:   'Movilidad',
  core:       'Core',
};

export function ExerciseSearch({ exercises, onSelect, onClose }: ExerciseSearchProps) {
  const [query, setQuery] = useState('');
  const [filterMuscle, setFilterMuscle] = useState<MuscleGroup | 'all'>('all');

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    return exercises.filter(e => {
      if (filterMuscle !== 'all' && !e.muscleGroups.includes(filterMuscle)) return false;
      if (!q) return true;
      return e.name.toLowerCase().includes(q);
    });
  }, [exercises, query, filterMuscle]);

  // Most common muscle groups for filter pills
  const popularMuscles: MuscleGroup[] = ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'core', 'biceps', 'triceps'];

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Search bar */}
      <div className="px-4 pt-2 pb-3 space-y-3">
        <Input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar ejercicio..."
          icon={<Search size={14} />}
          autoFocus
        />

        {/* Muscle filter pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
          <FilterPill active={filterMuscle === 'all'} onClick={() => setFilterMuscle('all')}>Todos</FilterPill>
          {popularMuscles.map(m => (
            <FilterPill key={m} active={filterMuscle === m} onClick={() => setFilterMuscle(m)}>
              {MUSCLE_GROUP_LABELS[m]}
            </FilterPill>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search size={24} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-sm text-[var(--text-tertiary)]">Sin resultados para "{query}"</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {filtered.map(ex => (
              <button
                key={ex.id}
                onClick={() => { onSelect(ex); onClose(); }}
                className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[var(--bg-hover)] transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{ex.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                    {CATEGORY_LABELS[ex.category]} · {ex.muscleGroups.slice(0, 2).map(m => MUSCLE_GROUP_LABELS[m]).join(', ')}
                  </p>
                </div>
                <span className="text-xs text-[var(--text-tertiary)] shrink-0 mt-0.5 capitalize">
                  {ex.equipment}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, children }: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'shrink-0 px-2.5 py-1 text-xs rounded-[var(--r-full)] border transition-colors',
        active
          ? 'bg-[var(--neutral-900)] text-white border-transparent'
          : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
      )}
    >
      {children}
    </button>
  );
}
