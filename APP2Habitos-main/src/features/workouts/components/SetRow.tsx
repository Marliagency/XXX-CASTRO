import { Check, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import type { ExerciseSet } from '../types';

interface SetRowProps {
  set: ExerciseSet;
  index: number;
  previousWeight?: number | null;
  previousReps?: number | null;
  onChange: (patch: Partial<ExerciseSet>) => void;
  onRemove: () => void;
  onComplete: () => void;
}

const SET_TYPE_COLORS: Record<ExerciseSet['type'], string> = {
  warmup:  'text-[var(--text-tertiary)] bg-[var(--neutral-100)]',
  working: 'text-[var(--text-primary)] bg-[var(--neutral-900)] text-white',
  dropset: 'text-[var(--warning)] bg-[var(--warning-subtle)]',
  failure: 'text-[var(--danger)] bg-[var(--danger-subtle)]',
  amrap:   'text-[var(--accent)] bg-[var(--accent-subtle)]',
  myo_rep: 'text-[var(--journal-color)] bg-[var(--journal-subtle)]',
};

export function SetRow({ set, index, previousWeight, previousReps, onChange, onRemove, onComplete }: SetRowProps) {
  return (
    <div className={clsx(
      'flex items-center gap-2 px-1 py-1.5 rounded-[var(--r-md)] transition-colors',
      set.completed ? 'bg-[var(--success-subtle)]' : 'hover:bg-[var(--bg-hover)]',
    )}>
      {/* Set number / type badge */}
      <div className={clsx(
        'w-7 h-7 rounded-[var(--r-sm)] flex items-center justify-center text-xs font-bold shrink-0',
        set.type === 'warmup' ? SET_TYPE_COLORS.warmup : ''
      )}>
        {set.type === 'warmup' ? 'C' : index + 1}
      </div>

      {/* Previous performance hint */}
      <div className="w-16 text-xs text-[var(--text-tertiary)] text-center shrink-0">
        {previousWeight != null && previousReps != null
          ? `${previousWeight}×${previousReps}`
          : '—'
        }
      </div>

      {/* Weight input */}
      <input
        type="number"
        inputMode="decimal"
        value={set.weight ?? ''}
        onChange={e => onChange({ weight: e.target.value ? Number(e.target.value) : null })}
        placeholder={previousWeight != null ? String(previousWeight) : 'kg'}
        className="flex-1 min-w-0 h-8 px-2 text-sm text-center bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-sm)] focus:outline-none focus:border-[var(--border-focus)] text-[var(--text-primary)]"
      />

      {/* Reps input */}
      <input
        type="number"
        inputMode="numeric"
        value={set.reps ?? ''}
        onChange={e => onChange({ reps: e.target.value ? Number(e.target.value) : null })}
        placeholder={previousReps != null ? String(previousReps) : 'reps'}
        className="flex-1 min-w-0 h-8 px-2 text-sm text-center bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-sm)] focus:outline-none focus:border-[var(--border-focus)] text-[var(--text-primary)]"
      />

      {/* Complete button */}
      <button
        onClick={onComplete}
        aria-label={set.completed ? 'Desmarcar set' : 'Completar set'}
        className={clsx(
          'w-8 h-8 rounded-[var(--r-sm)] flex items-center justify-center shrink-0 transition-all',
          set.completed
            ? 'bg-[var(--success)] text-white'
            : 'border border-[var(--border-default)] text-[var(--text-tertiary)] hover:border-[var(--success)] hover:text-[var(--success)]',
        )}
      >
        <Check size={14} strokeWidth={set.completed ? 3 : 2} />
      </button>

      {/* Remove */}
      <button
        onClick={onRemove}
        aria-label="Eliminar set"
        className="w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
