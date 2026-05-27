import clsx from 'clsx';
import { MOOD_EMOJI, MOOD_LABELS, MOOD_COLOR } from '../types';
import type { Mood } from '../types';

interface MoodPickerProps {
  value: Mood | null;
  onChange: (mood: Mood) => void;
  size?: 'sm' | 'md';
}

export function MoodPicker({ value, onChange, size = 'md' }: MoodPickerProps) {
  return (
    <div className="flex items-center gap-1.5">
      {([1, 2, 3, 4, 5] as Mood[]).map(m => (
        <button
          key={m}
          onClick={() => onChange(m)}
          title={MOOD_LABELS[m]}
          className={clsx(
            'flex flex-col items-center gap-0.5 rounded-[var(--r-lg)] transition-all',
            size === 'md' ? 'p-2 flex-1' : 'p-1.5',
            value === m
              ? 'bg-[var(--bg-selected)] ring-2'
              : 'hover:bg-[var(--bg-hover)]',
          )}
          style={value === m ? { outlineColor: MOOD_COLOR[m] } : undefined}
        >
          <span className={clsx(size === 'md' ? 'text-2xl' : 'text-lg')}>{MOOD_EMOJI[m]}</span>
          {size === 'md' && (
            <span className="text-[9px] text-[var(--text-tertiary)]">{MOOD_LABELS[m]}</span>
          )}
        </button>
      ))}
    </div>
  );
}

interface MoodDotProps {
  mood: Mood;
  size?: number;
}

export function MoodDot({ mood, size = 10 }: MoodDotProps) {
  return (
    <span
      title={MOOD_LABELS[mood]}
      className="inline-flex items-center justify-center rounded-full text-[10px]"
      style={{ width: size, height: size, backgroundColor: MOOD_COLOR[mood] }}
    />
  );
}
