import { useState } from 'react';
import { motion } from 'framer-motion';
import { useBadHabitsStore } from '../../store/badHabitsStore';
import { SobrietyTimer } from './SobrietyTimer';
import { RelapseModal } from './RelapseModal';
import { BadHabitDetail } from './BadHabitDetail';
import { Button } from '../../../../shared/components/ui';
import { fmt } from '../../../../shared/utils/fmt';
import type { BadHabit } from '../../types/badHabits';

interface BadHabitCardProps {
  habit: BadHabit;
}

export function BadHabitCard({ habit }: BadHabitCardProps) {
  const { getDaysSober, getSavingsAmount, getNextMilestone, resetSobriety } = useBadHabitsStore();
  const [showDetail, setShowDetail]   = useState(false);
  const [showRelapse, setShowRelapse] = useState(false);

  const daysSober    = getDaysSober(habit.id);
  const savings      = getSavingsAmount(habit.id);
  const nextMilestone = getNextMilestone(habit.id);
  const daysToNext   = nextMilestone ? nextMilestone.days - daysSober : null;
  const progress     = nextMilestone
    ? Math.min((daysSober / nextMilestone.days) * 100, 100)
    : 100;

  return (
    <>
      <motion.div
        className="bg-[var(--bg-surface)] rounded-[var(--r-xl)] p-5 border border-[var(--border-subtle)] cursor-pointer"
        whileTap={{ scale: 0.99 }}
        onClick={() => setShowDetail(true)}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-11 h-11 rounded-[var(--r-lg)] flex items-center justify-center shrink-0"
            style={{ background: 'var(--bg-base)', fontSize: 22 }}
          >
            {habit.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[var(--text-primary)] truncate">{habit.name}</p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Desde {new Date(habit.startDate).toLocaleDateString('es-ES', {
                day: 'numeric', month: 'short',
              })}
            </p>
          </div>
          {habit.relapses.length > 0 && (
            <div
              className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ background: 'var(--warning-subtle)', color: 'var(--warning)' }}
            >
              {habit.relapses.length} recaída{habit.relapses.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

        {/* Timer */}
        <div className="mb-4">
          <SobrietyTimer startDate={habit.startDate} />
        </div>

        {/* Próximo hito */}
        {nextMilestone && (
          <div className="mb-3">
            <div className="flex justify-between mb-1.5">
              <span className="text-xs text-[var(--text-secondary)]">
                Próximo: {nextMilestone.emoji} {nextMilestone.label}
              </span>
              <span className="text-xs font-mono text-[var(--text-tertiary)]">
                {daysToNext}d
              </span>
            </div>
            <div
              className="h-1 rounded-full overflow-hidden"
              style={{ background: 'var(--bg-base)' }}
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'var(--qyro-grad)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Ahorro */}
        {savings > 0 && (
          <div
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-[var(--r-lg)] mb-3"
            style={{ background: 'var(--success-subtle)' }}
          >
            <span style={{ fontSize: 16 }}>💰</span>
            <span className="text-sm font-semibold" style={{ color: 'var(--success)' }}>
              Ahorrado: {fmt(savings, { decimals: 2 })} {habit.savings?.currency ?? '€'}
            </span>
          </div>
        )}

        {/* Acciones */}
        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-red-500 hover:text-red-600"
            onClick={() => setShowRelapse(true)}
          >
            😔 Recaí
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={() => setShowDetail(true)}
          >
            Ver detalle
          </Button>
        </div>
      </motion.div>

      <BadHabitDetail habit={habit} isOpen={showDetail} onClose={() => setShowDetail(false)} />

      <RelapseModal
        isOpen={showRelapse}
        habitName={habit.name}
        onConfirm={(note, trigger) => {
          resetSobriety(habit.id, note, trigger);
          setShowRelapse(false);
        }}
        onCancel={() => setShowRelapse(false)}
      />
    </>
  );
}
