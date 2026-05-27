import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, Edit2, Trash2, CheckCircle2, TrendingUp, Utensils, Dumbbell, Brain, ListTodo, Zap, Sparkles } from 'lucide-react';
import { useGoalsStore } from '../store/goalsStore';
import { useJournalStore } from '../../journal/store/journalStore';
import { useNutritionStore } from '../../nutrition/store/nutritionStore';
import { useHabitsStore } from '../../habits/store/habitsStore';
import { useWorkoutsStore } from '../../workouts/store/workoutsStore';
import { evaluateGoalProgress } from '../utils/goalInference';
import { INTENT_LABELS, INTENT_EMOJIS, PRIORITY_LABELS, PRIORITY_EMOJIS } from '../types';
import { Button, EmptyState, Skeleton } from '../../../shared/components/ui';
import { useToast } from '../../../shared/components/ui';
import { fmt } from '../../../shared/utils/fmt';
import { format, subDays } from 'date-fns';

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div
      className="w-16 h-16 rounded-full flex items-center justify-center border-4 shrink-0"
      style={{ borderColor: color }}
    >
      <span className="text-lg font-bold" style={{ color }}>{score}</span>
    </div>
  );
}


export default function GoalsHubView() {
  const navigate  = useNavigate();
  const { toast } = useToast();
  const { goal, loaded, loadFromStorage, clearGoal } = useGoalsStore();
  const { getAverageMood }       = useJournalStore();
  const { getTotalsForDate, targets: nutritionTargets, setTargets } = useNutritionStore();
  const { entries: habitEntries, habits, addHabit } = useHabitsStore();
  const { workouts }             = useWorkoutsStore();

  useEffect(() => {
    if (!loaded) loadFromStorage();
  }, [loaded, loadFromStorage]);

  if (!loaded) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Target size={20} className="text-[var(--text-tertiary)]" />
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Objetivos</h1>
        </div>
        <EmptyState
          icon={<Target size={24} />}
          title="Sin objetivo activo"
          description="Define tu objetivo principal y la app ajustará tus recomendaciones de entreno, nutrición y hábitos."
          action={{ label: 'Crear mi objetivo', onClick: () => navigate('/goals/wizard') }}
        />
      </div>
    );
  }

  // Compute progress from real store data
  const today  = format(new Date(), 'yyyy-MM-dd');
  const cutoff = format(subDays(new Date(), 7), 'yyyy-MM-dd');

  // Avg calories (last 7 days)
  const last7 = Array.from({ length: 7 }, (_, i) =>
    format(subDays(new Date(), i), 'yyyy-MM-dd')
  );
  const calorieReadings = last7
    .map(d => getTotalsForDate(d).calories)
    .filter(c => c > 0);
  const avgCalories = calorieReadings.length > 0
    ? calorieReadings.reduce((a, b) => a + b, 0) / calorieReadings.length
    : null;

  const proteinReadings = last7
    .map(d => getTotalsForDate(d).protein)
    .filter(p => p > 0);
  const avgProtein = proteinReadings.length > 0
    ? proteinReadings.reduce((a, b) => a + b, 0) / proteinReadings.length
    : null;

  // Workouts this week
  const workoutsThisWeek = workouts.filter(w => w.date >= cutoff && w.date <= today).length;

  // Habit completion this week
  const totalPossible   = Math.min(7, habits.length) * 7;
  const completedEntries = habitEntries.filter(e => e.date >= cutoff && e.count > 0).length;
  const habitPct = totalPossible > 0 ? (completedEntries / totalPossible) * 100 : 0;

  const avgMood = getAverageMood(7);

  const progress = evaluateGoalProgress(goal.derived, {
    avgCalories,
    avgProtein,
    workoutSessionsThisWeek: workoutsThisWeek,
    habitCompletionPct: habitPct,
    avgMood,
  });

  const handleApplyNutritionTargets = async () => {
    if (!goal) return;
    await setTargets({
      calories: goal.derived.calorieTarget,
      protein:  goal.derived.proteinG,
      carbs:    goal.derived.carbsG,
      fat:      goal.derived.fatG,
    });
    toast('Objetivos nutricionales aplicados desde tu meta', 'success');
  };

  const handleClear = async () => {
    await clearGoal();
    toast('Objetivo eliminado', 'info');
  };

  const handleAddHabit = async (suggestion: string) => {
    await addHabit({
      name: suggestion,
      emoji: '✨',
      color: '#6366f1',
      category: 'other',
      frequency: { type: 'daily', days: [0,1,2,3,4,5,6], timesPerWeek: null },
      schedule: null,
      type: 'boolean',
      targetCount: null,
      unit: null,
      difficulty: 'medium',
      linkedHabitId: null,
      archivedAt: null,
    });
    toast(`Hábito "${suggestion.slice(0, 30)}…" añadido`, 'success');
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target size={20} className="text-[var(--text-tertiary)]" />
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Objetivos</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" icon={<Edit2 size={13} />} onClick={() => navigate('/goals/wizard')}>
            Editar
          </Button>
        </div>
      </div>

      {/* Apply targets to Nutrition banner */}
      {!nutritionTargets && (
        <div className="flex items-center gap-3 px-3 py-2.5 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-[var(--r-xl)]">
          <Sparkles size={14} className="text-[var(--accent)] shrink-0" />
          <p className="text-xs text-[var(--text-secondary)] flex-1">
            Aplica los objetivos de calorías y proteína a la sección de Nutrición
          </p>
          <button
            onClick={handleApplyNutritionTargets}
            aria-label="Aplicar objetivos nutricionales"
            className="shrink-0 px-2.5 py-1 bg-[var(--accent)] text-white text-[10px] font-medium rounded-[var(--r-md)] hover:opacity-90 transition-opacity"
          >
            Aplicar
          </button>
        </div>
      )}

      {/* Active goal card */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
        <div className="flex items-center gap-4">
          <ScoreBadge score={progress.score} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{INTENT_EMOJIS[goal.intent]}</span>
              <p className="text-base font-semibold text-[var(--text-primary)]">{INTENT_LABELS[goal.intent]}</p>
            </div>
            <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">{goal.derived.weeklyGoalSummary}</p>
          </div>
        </div>
      </div>

      {/* Targets */}
      <div className="section-group">
        <p className="section-header">Parámetros del objetivo</p>
        <div className="section-body">
          {[
            { label: 'Calorías objetivo',  val: `${fmt(goal.derived.calorieTarget, { integer: true })} kcal`, icon: <Utensils size={14} />, color: 'var(--warning)' },
            { label: 'Proteína diaria',    val: `${fmt(goal.derived.proteinG, { integer: true })} g`,          icon: <TrendingUp size={14} />, color: 'var(--accent)' },
            { label: 'Entrenos / semana',  val: `${goal.derived.workoutDaysPerWeek} sesiones`,                  icon: <Dumbbell size={14} />, color: '#34c759' },
            { label: 'Estilo de entreno',  val: goal.derived.workoutType,                                       icon: <Zap size={14} />, color: 'var(--text-tertiary)' },
          ].map(({ label, val, icon, color }) => (
            <div key={label} className="section-row">
              <div className="section-row-icon" style={{ background: `${color}18`, color }}>
                {icon}
              </div>
              <div className="section-row-content">
                <span className="section-row-label">{label}</span>
                <span className="section-row-value" style={{ color, fontWeight: 600 }}>{val}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly progress */}
      <div className="section-group">
        <p className="section-header">Progreso esta semana</p>
        <div className="section-body">
          {[
            { icon: <Utensils size={14} />, label: `Nutrición — ${avgCalories !== null ? fmt(avgCalories, { integer: true }) : '–'} kcal/día`, ok: progress.nutritionOk, color: 'var(--warning)' },
            { icon: <Dumbbell size={14} />, label: `Entrenos — ${workoutsThisWeek} de ${goal.derived.workoutDaysPerWeek} sesiones`, ok: progress.workoutOk, color: '#34c759' },
            { icon: <ListTodo size={14} />, label: `Hábitos — ${fmt(habitPct, { integer: true })}% cumplimiento`, ok: progress.habitsOk, color: 'var(--accent)' },
            { icon: <Brain size={14} />,    label: `Ánimo — ${avgMood !== null ? fmt(avgMood, { decimals: 1 }) : '–'}/5 media`, ok: progress.moodOk, color: '#af52de' },
          ].map(({ icon, label, ok, color }) => (
            <div key={label} className="section-row">
              <div className="section-row-icon" style={{ background: ok ? `${color}18` : 'var(--bg-hover)', color: ok ? color : 'var(--text-tertiary)' }}>
                {icon}
              </div>
              <div className="section-row-content">
                <span className="section-row-label">{label}</span>
                <CheckCircle2 size={15} style={{ color: ok ? 'var(--success)' : 'var(--text-tertiary)', opacity: ok ? 1 : 0.3, flexShrink: 0 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Smart adjustments */}
      {progress.adjustments.length > 0 && (
        <div className="section-group">
          <p className="section-header" style={{ color: 'var(--warning)' }}>Ajustes sugeridos</p>
          <div className="section-body">
            {progress.adjustments.map((adj, i) => (
              <div key={i} className="px-4 py-2.5 flex items-start gap-2">
                <span className="text-[var(--warning)] shrink-0 mt-0.5">→</span>
                <span className="text-sm text-[var(--text-secondary)]">{adj}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habit suggestions */}
      <div className="section-group">
        <p className="section-header">Hábitos recomendados</p>
        <div className="section-body">
          {goal.derived.habitSuggestions.slice(0, 5).map((h, i) => {
            const alreadyAdded = habits.some(hab => hab.name === h);
            return (
              <div key={i} className="section-row">
                <div className="section-row-content">
                  <span className="section-row-label">{h}</span>
                  {alreadyAdded ? (
                    <span className="text-[10px] text-[var(--success)] font-medium shrink-0">Añadido ✓</span>
                  ) : (
                    <button
                      onClick={() => handleAddHabit(h)}
                      className="shrink-0 px-2.5 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent)]/20 transition-colors"
                    >
                      Añadir
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Journal prompts */}
      <div className="section-group">
        <p className="section-header">Preguntas de reflexión</p>
        <div className="section-body">
          {goal.derived.journalPrompts.map((p, i) => (
            <div key={i} className="px-4 py-2.5 border-l-2 mx-4 rounded-sm mb-1" style={{ borderColor: 'var(--accent)', background: 'var(--bg-base)' }}>
              <p className="text-sm text-[var(--text-secondary)]">{p}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Priorities */}
      <div className="section-group">
        <p className="section-header">Áreas prioritarias</p>
        <div className="section-body">
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {goal.priorities.map(p => (
              <span key={p} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'var(--accent)18', color: 'var(--accent)' }}>
                {PRIORITY_EMOJIS[p]} {PRIORITY_LABELS[p]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Danger zone */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleClear}
          className="flex items-center gap-1.5 text-xs text-[var(--danger)] hover:opacity-80 transition-opacity"
        >
          <Trash2 size={12} />
          Eliminar objetivo
        </button>
      </div>
    </div>
  );
}
