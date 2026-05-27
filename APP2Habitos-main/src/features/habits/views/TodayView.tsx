import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Sun, Moon, Sunset, Flame, CheckSquare, Smile, Utensils, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useHabits } from '../hooks/useHabits';
import { useTasksStore } from '../../tasks/store/tasksStore';
import { EmptyState, Skeleton, AnimatedCheck, CompletionBurst, useCompletionBurst } from '../../../shared/components/ui';
import { useJournalStore } from '../../journal/store/journalStore';
import { MOOD_EMOJI, MOOD_LABELS } from '../../journal/types';
import { useNutritionStore } from '../../nutrition/store/nutritionStore';
import { useNutritionTargets } from '../../nutrition/hooks/useNutritionTargets';
import { useTodayItems } from '../../today/hooks/useTodayItems';
import { listContainerVariants, listItemVariants } from '../../../shared/animations';
import { fmt } from '../../../shared/utils/fmt';
import type { TodayItem } from '../../today/hooks/useTodayItems';

function getGreeting(): { text: string; Icon: typeof Sun } {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Buenos días',   Icon: Sun };
  if (h < 19) return { text: 'Buenas tardes', Icon: Sunset };
  return              { text: 'Buenas noches', Icon: Moon };
}

// ── Task row ──────────────────────────────────────────────────────────────────

function TaskRow({ item, onToggle }: { item: TodayItem; onToggle: () => void }) {
  const { bursting, trigger } = useCompletionBurst();
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
    >
      {/* Animated check */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <AnimatedCheck
          checked={item.completed}
          onChange={() => { if (!item.completed) trigger(); onToggle(); }}
          color={item.color}
          size={28}
        />
        <CompletionBurst active={bursting} color={item.color} />
      </div>

      {/* Emoji */}
      <span style={{ fontSize: 16, flexShrink: 0 }}>{item.emoji}</span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {item.isOverdue && (
            <span className="text-[10px] font-semibold text-red-500">⚠ Vencida</span>
          )}
          {item.priority !== 'none' && (
            <span
              className="text-[10px] font-semibold"
              style={{ color: item.color }}
            >
              {item.priority === 'urgent' ? 'Urgente' :
               item.priority === 'high'   ? 'Alta' :
               item.priority === 'medium' ? 'Media' : 'Baja'}
            </span>
          )}
        </div>
      </div>

      {/* Task badge */}
      <span
        className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0"
        style={{ background: 'var(--c-tasks)18', color: 'var(--c-tasks)' }}
      >
        Tarea
      </span>
    </div>
  );
}

// ── Progress bar ─────────────────────────────────────────────────────────────

function TodayProgressBar({ pct, completed, total }: { pct: number; completed: number; total: number }) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-[var(--text-secondary)]">
          {completed} de {total} completados
        </span>
        <span
          className="text-sm font-semibold tabular"
          style={{
            color: pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--text-secondary)',
          }}
        >
          {fmt(pct, { decimals: 1 })}%
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: pct >= 80 ? 'var(--success)' : 'var(--qyro-grad)' }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export default function TodayView() {
  const navigate = useNavigate();
  const [showCompleted, setShowCompleted] = useState(false);

  const {
    todayHabits, totalToday, loaded: habitsLoaded,
    markComplete, unmark,
  } = useHabits();

  const { completeTask } = useTasksStore();

  const today = format(new Date(), 'yyyy-MM-dd');
  const { getMoodByDate } = useJournalStore();
  const todayMood = getMoodByDate(today);
  const { text: greeting, Icon: GreetingIcon } = getGreeting();

  const { getTotalsForDate } = useNutritionStore();
  const targets = useNutritionTargets();
  const nutritionTotals = getTotalsForDate(today);
  const hasNutritionData = nutritionTotals.calories > 0;

  const { scheduled, unscheduled, completed: completedItems, stats, loaded } = useTodayItems();

  const allTotal    = stats.totalHabits + stats.totalTasks;
  const allCompleted = stats.completedHabits + stats.completedTasks;

  if (!habitsLoaded || !loaded) {
    return (
      <div className="p-4 md:p-6 space-y-4">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-20 w-full" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  const handleHabitToggle = (habitId: string, isDone: boolean) => {
    if (isDone) unmark(habitId, today);
    else markComplete(habitId);
  };

  const handleTaskToggle = (item: TodayItem) => {
    if (!item.task) return;
    completeTask(item.task.id);
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5">
      {/* Greeting */}
      <div className="flex items-start gap-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-11 h-11 rounded-[var(--r-xl)] bg-[var(--warning-subtle)] flex items-center justify-center shrink-0"
        >
          <GreetingIcon size={22} className="text-[var(--warning)]" />
        </motion.div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">{greeting}</h1>
          <p className="text-sm text-[var(--text-tertiary)] capitalize mt-0.5">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
          </p>
        </div>
      </div>

      {/* Progress card — global */}
      {allTotal > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] p-4 space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {allCompleted === allTotal && allTotal > 0
                ? <CheckCircle2 size={16} className="text-[var(--success)]" />
                : <Flame size={16} className="text-[var(--warning)]" />
              }
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {allCompleted === allTotal && allTotal > 0 ? '¡Día completado! 🎉' : 'Progreso del día'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
              <span>🔵 {stats.completedHabits}/{stats.totalHabits}</span>
              <span>📋 0/{stats.totalTasks}</span>
            </div>
          </div>
          <TodayProgressBar
            pct={stats.overallPct}
            completed={allCompleted}
            total={allTotal}
          />
        </motion.div>
      )}

      {/* Quick mood card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] p-3 flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-full bg-[var(--bg-hover)] flex items-center justify-center text-xl shrink-0">
          {todayMood ? MOOD_EMOJI[todayMood] : <Smile size={16} className="text-[var(--text-tertiary)]" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-[var(--text-primary)]">Estado de ánimo</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">
            {todayMood ? MOOD_LABELS[todayMood] : 'Sin registrar hoy'}
          </p>
        </div>
        <button
          onClick={() => navigate('/journal')}
          className="shrink-0 px-2.5 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent)]/20 transition-colors"
        >
          {todayMood ? 'Ver diario' : 'Registrar'}
        </button>
      </motion.div>

      {/* Nutrition quick card */}
      {(hasNutritionData || targets) && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] p-3 flex items-center gap-3"
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'var(--c-nutrition)18' }}
          >
            <Utensils size={15} style={{ color: 'var(--c-nutrition)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-[var(--text-primary)]">Nutrición de hoy</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {hasNutritionData
                ? `${fmt(nutritionTotals.calories, { integer: true })} kcal${targets ? ` / ${fmt(targets.calories, { integer: true })}` : ''}`
                : 'Sin registros aún'}
            </p>
            {hasNutritionData && targets && (
              <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (nutritionTotals.calories / targets.calories) * 100)}%`,
                    background: 'var(--c-nutrition)',
                  }}
                />
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/nutrition')}
            className="shrink-0 px-2.5 py-1 text-[10px] font-medium rounded-[var(--r-md)] hover:opacity-80 transition-opacity"
            style={{ background: 'var(--c-nutrition)18', color: 'var(--c-nutrition)' }}
          >
            {hasNutritionData ? 'Ver' : 'Añadir'}
          </button>
        </motion.div>
      )}

      {/* ── Scheduled habits/tasks ── */}
      {scheduled.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
            Programado
          </p>
          <motion.div
            className="space-y-2"
            variants={listContainerVariants}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="popLayout">
              {scheduled.map(item => (
                <motion.div key={item.id} variants={listItemVariants} layout>
                  {item.type === 'task' ? (
                    <TaskRow item={item} onToggle={() => handleTaskToggle(item)} />
                  ) : (
                    (() => {
                      const h = todayHabits.find(h => h.id === item.habit?.id);
                      if (!h) return null;
                      const { entry, stats, ...habit } = h;
                      return (
                        <div
                          key={`habit-${habit.id}`}
                          className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                        >
                          <div style={{ position: 'relative', flexShrink: 0 }}>
                            <AnimatedCheck
                              checked={item.completed}
                              onChange={() => handleHabitToggle(habit.id, item.completed)}
                              color={habit.color}
                              size={28}
                            />
                          </div>
                          <span style={{ fontSize: 16 }}>{habit.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--text-primary)] truncate">{habit.name}</p>
                            {item.time && (
                              <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{item.time}</p>
                            )}
                          </div>
                          {stats && stats.currentStreak > 1 && (
                            <span className="flex items-center gap-0.5 text-xs text-[var(--warning)] shrink-0">
                              <Flame size={10} />
                              {stats.currentStreak}
                            </span>
                          )}
                        </div>
                      );
                    })()
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* ── Tasks section ── */}
      {unscheduled.filter(i => i.type === 'task').length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
            Tareas de hoy
          </p>
          <motion.div
            className="space-y-2"
            variants={listContainerVariants}
            initial="initial"
            animate="animate"
          >
            <AnimatePresence mode="popLayout">
              {unscheduled.filter(i => i.type === 'task').map(item => (
                <motion.div key={item.id} variants={listItemVariants} layout>
                  <TaskRow item={item} onToggle={() => handleTaskToggle(item)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* ── Habits section ── */}
      {totalToday === 0 ? (
        <EmptyState
          icon={<CheckSquare size={24} />}
          title="Sin hábitos para hoy"
          description="Configura tus hábitos para ver tu progreso diario aquí."
          action={{ label: 'Ir a Hábitos', onClick: () => navigate('/habits') }}
        />
      ) : (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">
            Hábitos de hoy
          </p>
          <AnimatePresence initial={false}>
            {todayHabits.map(({ entry, stats, ...habit }) => {
              // Skip habits already shown in scheduled section
              const inScheduled = scheduled.some(s => s.habit?.id === habit.id);
              if (inScheduled) return null;
              return (
                <div key={habit.id}>
                  {/* Reuse HabitCard for all controls (skip, count, etc) */}
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)] bg-[var(--bg-surface)] border border-[var(--border-subtle)]"
                    style={{ opacity: entry?.skipped ? 0.4 : 1 }}
                  >
                    <div
                      className="w-1 h-10 rounded-full shrink-0"
                      style={{ backgroundColor: habit.color }}
                    />
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <AnimatedCheck
                        checked={!!(entry && !entry.skipped && (habit.type === 'count' ? entry.count >= (habit.targetCount ?? 1) : entry.count > 0))}
                        onChange={(checked) => {
                          if (checked) markComplete(habit.id);
                          else unmark(habit.id, today);
                        }}
                        color={habit.color}
                        size={28}
                      />
                    </div>
                    <span style={{ fontSize: 16 }}>{habit.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{habit.name}</p>
                      <div className="flex items-center gap-2">
                        {habit.schedule?.time && (
                          <span className="text-[10px] text-[var(--text-tertiary)]">{habit.schedule.time}</span>
                        )}
                        {stats && stats.currentStreak > 1 && (
                          <span className="flex items-center gap-0.5 text-[10px] text-[var(--warning)]">
                            <Flame size={9} />
                            {stats.currentStreak}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Completed (collapsible) */}
      {completedItems.length > 0 && (
        <div>
          <button
            onClick={() => setShowCompleted(v => !v)}
            className="flex items-center gap-2 text-xs text-[var(--text-tertiary)] py-2 hover:text-[var(--text-secondary)] transition-colors"
          >
            <motion.span animate={{ rotate: showCompleted ? 90 : 0 }} transition={{ duration: 0.15 }}>
              ›
            </motion.span>
            <span className="font-semibold uppercase tracking-wider">
              Completados ({completedItems.length})
            </span>
          </button>
          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden space-y-2"
              >
                {completedItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 px-4 py-2 rounded-[var(--r-lg)] bg-[var(--bg-base)] opacity-50"
                  >
                    <CheckCircle2 size={18} className="text-[var(--success)] shrink-0" />
                    <span style={{ fontSize: 14 }}>{item.emoji}</span>
                    <p className="text-sm text-[var(--text-tertiary)] line-through truncate">{item.title}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Empty state when no habits or tasks */}
      {totalToday === 0 && unscheduled.filter(i => i.type === 'task').length === 0 && (
        <div className="text-center py-8">
          <span style={{ fontSize: 44 }}>✨</span>
          <p className="text-lg font-semibold mt-3">Día libre</p>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Sin hábitos ni tareas para hoy
          </p>
        </div>
      )}
    </div>
  );
}
