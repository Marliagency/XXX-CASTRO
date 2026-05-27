import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, MoreHorizontal, SkipForward, Minus, Plus } from 'lucide-react';
import clsx from 'clsx';
import type { Habit, HabitEntry, HabitStats } from '../types';
import { Badge, AnimatedCheck, CompletionBurst, useCompletionBurst } from '../../../shared/components/ui';

interface HabitCardProps {
  habit: Habit;
  entry: HabitEntry | null;
  stats: HabitStats | null;
  onComplete: () => void;
  onUnmark: () => void;
  onSkip: () => void;
  onIncrement?: () => void;
  onDecrement?: () => void;
  onClick?: () => void;
}

export function HabitCard({
  habit, entry, stats, onComplete, onUnmark, onSkip,
  onIncrement, onDecrement, onClick,
}: HabitCardProps) {
  const [showActions, setShowActions] = useState(false);
  const { bursting, trigger } = useCompletionBurst();

  const isDone = !!entry && !entry.skipped && entry.count > 0;
  const isSkipped = !!entry?.skipped;
  const isCount = habit.type === 'count';
  const currentCount = entry?.count ?? 0;
  const targetCount = habit.targetCount ?? 1;
  const countProgress = isCount ? Math.min(currentCount / targetCount, 1) : isDone ? 1 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)]',
        'bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
        'transition-all duration-200',
        isDone && 'opacity-70',
        isSkipped && 'opacity-40',
      )}
    >
      {/* Color strip */}
      <div
        className="w-1 h-10 rounded-full shrink-0"
        style={{ backgroundColor: habit.color }}
      />

      {/* Check / counter */}
      {isCount ? (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onDecrement}
            disabled={currentCount === 0}
            aria-label="Reducir"
            className="w-6 h-6 rounded-full bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 transition-colors"
          >
            <Minus size={12} />
          </button>
          <span className="text-xs font-mono w-10 text-center text-[var(--text-primary)]">
            {currentCount}/{targetCount}
          </span>
          <button
            onClick={onIncrement}
            aria-label="Incrementar"
            className="w-6 h-6 rounded-full bg-[var(--bg-base)] flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Plus size={12} />
          </button>
        </div>
      ) : (
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <AnimatedCheck
            checked={isDone}
            onChange={(checked) => {
              if (checked) { trigger(); onComplete(); }
              else onUnmark();
            }}
            color={habit.color}
            size={28}
          />
          <CompletionBurst active={bursting} color={habit.color} />
        </div>
      )}

      {/* Info */}
      <button className="flex-1 text-left min-w-0" onClick={onClick}>
        <div className="flex items-center gap-1.5">
          <span className="text-base leading-none">{habit.emoji}</span>
          <span className={clsx(
            'text-sm font-medium truncate',
            isDone ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]',
          )}>
            {habit.name}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {habit.schedule?.time && (
            <span className="text-xs text-[var(--text-tertiary)]">
              {habit.schedule.time}
              {habit.schedule.duration != null ? ` · ${habit.schedule.duration}min` : ''}
            </span>
          )}
          {stats && stats.currentStreak > 1 && (
            <span className="flex items-center gap-0.5 text-xs text-[var(--warning)]">
              <Flame size={10} />
              {stats.currentStreak}
            </span>
          )}
          {isSkipped && <Badge variant="warning">Saltado</Badge>}
        </div>
        {isCount && (
          <div className="mt-1.5 h-1 bg-[var(--neutral-100)] rounded-full overflow-hidden w-24">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${countProgress * 100}%`, backgroundColor: habit.color }}
            />
          </div>
        )}
      </button>

      {/* Actions menu */}
      <div className="relative shrink-0">
        <button
          onClick={() => setShowActions(v => !v)}
          aria-label="Más opciones"
          className="w-7 h-7 rounded-[var(--r-sm)] flex items-center justify-center text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
        >
          <MoreHorizontal size={15} />
        </button>
        <AnimatePresence>
          {showActions && (
            <>
              {/* Backdrop to close */}
              <div
                className="fixed inset-0 z-[9]"
                onClick={() => setShowActions(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-8 z-10 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-lg)] shadow-[var(--shadow-lg)] py-1 w-40"
              >
                <button
                  onClick={() => { onSkip(); setShowActions(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <SkipForward size={14} />
                  Saltarse hoy
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
