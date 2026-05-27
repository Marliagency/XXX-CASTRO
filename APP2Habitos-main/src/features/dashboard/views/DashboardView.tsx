import { useEffect } from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ListTodo, Utensils, Target } from 'lucide-react';
import { useHabitsStore }    from '../../habits/store/habitsStore';
import { useWorkoutsStore }  from '../../workouts/store/workoutsStore';
import { useJournalStore }   from '../../journal/store/journalStore';
import { useNutritionStore } from '../../nutrition/store/nutritionStore';
import { useTasksStore }     from '../../tasks/store/tasksStore';
import { useGoalsStore }     from '../../goals/store/goalsStore';
import { useDashboardData }  from '../hooks/useDashboardData';
import { useAchievements }   from '../hooks/useAchievements';
import { ActivityRings }     from '../components/ActivityRings';
import { KPIBand }           from '../components/KPIBand';
import { LifeScoreSection }  from '../components/LifeScoreSection';
import { HabitsSection }     from '../components/HabitsSection';
import { WorkoutsSection }   from '../components/WorkoutsSection';
import { Skeleton }          from '../../../shared/components/ui';
import { MOOD_EMOJI, MOOD_COLOR, MOOD_LABELS } from '../../journal/types';
import type { Mood } from '../../journal/types';
import { fmt } from '../../../shared/utils/fmt';
import { useUserProfile } from '../../user/hooks/useUserProfile';
import { ProfileCompletionBanner } from '../../user/components/ProfileCompletionBanner';

function DashboardSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}

// ─── Quick action pill ────────────────────────────────────────────────────────
function QuickLink({ icon, label, to, sub, accent }: {
  icon: React.ReactNode; label: string; to: string; sub?: string; accent?: string;
}) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="flex items-center gap-2.5 px-3 py-2.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] hover:border-[var(--border-default)] transition-all text-left w-full"
    >
      <div className="shrink-0" style={{ color: accent ?? 'var(--accent)' }}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-[var(--text-primary)] truncate">{label}</p>
        {sub && <p className="text-[10px] text-[var(--text-tertiary)]">{sub}</p>}
      </div>
    </button>
  );
}

// ─── Today's mood display ─────────────────────────────────────────────────────
function TodayMoodCard({ mood, onLog }: { mood: Mood | null; onLog: () => void }) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--bg-hover)] text-xl shrink-0">
        {mood ? MOOD_EMOJI[mood] : '?'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-[var(--text-primary)]">Estado de ánimo hoy</p>
        <p className="text-[10px] text-[var(--text-tertiary)]">
          {mood ? MOOD_LABELS[mood] : 'Sin registrar aún'}
        </p>
      </div>
      {!mood && (
        <button
          onClick={onLog}
          aria-label="Registrar estado de ánimo"
          className="shrink-0 px-2.5 py-1 bg-[var(--accent)] text-white text-[10px] font-medium rounded-[var(--r-md)] hover:opacity-90 transition-opacity"
        >
          Registrar
        </button>
      )}
      {mood && (
        <div
          className="w-2 h-2 rounded-full shrink-0"
          style={{ backgroundColor: MOOD_COLOR[mood] }}
        />
      )}
    </div>
  );
}

// ─── Calorie progress bar ──────────────────────────────────────────────────────
function CalorieBar({ calories, target }: { calories: number; target: number }) {
  const pct  = Math.min(100, Math.round((calories / target) * 100));
  const over = calories > target;
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-[var(--text-primary)]">Calorías hoy</p>
        <p className="text-xs font-bold" style={{ color: over ? 'var(--danger)' : 'var(--success)' }}>
          {calories} <span className="text-[var(--text-tertiary)] font-normal">/ {target} kcal</span>
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--bg-hover)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: over ? 'var(--danger)' : 'var(--success)',
          }}
        />
      </div>
    </div>
  );
}

// ─── Weekly summary card ──────────────────────────────────────────────────────
function WeeklySummaryCard({
  weekHabitPct,
  workoutsThisWeek,
  workoutTarget,
  avgCalories7d,
  calorieTarget,
  avgMood7d,
}: {
  weekHabitPct: number;
  workoutsThisWeek: number;
  workoutTarget: number | null;
  avgCalories7d: number | null;
  calorieTarget: number | null;
  avgMood7d: number | null;
}) {
  const habitColor = weekHabitPct >= 70 ? 'var(--success)' : weekHabitPct >= 40 ? 'var(--warning)' : 'var(--danger)';
  const calOk = avgCalories7d !== null && calorieTarget !== null && Math.abs(avgCalories7d - calorieTarget) / calorieTarget < 0.15;
  const moodColor = avgMood7d === null ? 'var(--text-tertiary)' : avgMood7d >= 4 ? 'var(--success)' : avgMood7d >= 3 ? 'var(--warning)' : 'var(--danger)';

  const items = [
    {
      label: 'Hábitos',
      value: `${weekHabitPct}%`,
      sub: 'cumplimiento',
      color: habitColor,
    },
    {
      label: 'Entrenos',
      value: workoutTarget ? `${workoutsThisWeek}/${workoutTarget}` : `${workoutsThisWeek}`,
      sub: 'esta semana',
      color: (workoutTarget ? workoutsThisWeek >= workoutTarget : workoutsThisWeek > 0)
        ? 'var(--success)' : 'var(--warning)',
    },
    {
      label: 'Calorías',
      value: avgCalories7d !== null ? `${avgCalories7d}` : '–',
      sub: calorieTarget ? `obj. ${calorieTarget}` : 'media 7d',
      color: calOk ? 'var(--success)' : avgCalories7d !== null ? 'var(--warning)' : 'var(--text-tertiary)',
    },
    {
      label: 'Ánimo',
      value: avgMood7d !== null ? `${fmt(avgMood7d, { decimals: 1 })}/5` : '–',
      sub: 'media 7d',
      color: moodColor,
    },
  ];

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
      <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">Esta semana</p>
      <div className="grid grid-cols-4 gap-2 text-center">
        {items.map(({ label, value, sub, color }) => (
          <div key={label}>
            <p className="text-base font-bold leading-none" style={{ color }}>{value}</p>
            <p className="text-[10px] font-medium text-[var(--text-primary)] mt-1">{label}</p>
            <p className="text-[9px] text-[var(--text-tertiary)]">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Achievements table ────────────────────────────────────────────────────────
function AchievementsTable() {
  const navigate = useNavigate();
  const achievements = useAchievements();

  if (achievements.length === 0) return null;

  return (
    <div className="section-group">
      <p className="section-header">Logros</p>
      <div className="section-body">
        {achievements.map(a => (
          <button
            key={a.id}
            onClick={() => navigate(a.route)}
            className="section-row section-row-pressable w-full text-left"
          >
            <div
              className="section-row-icon"
              style={{ background: `${a.color}18`, color: a.color }}
            >
              <span style={{ fontSize: 16 }}>{a.emoji}</span>
            </div>
            <div className="section-row-content">
              <div>
                <span className="section-row-label">{a.title}</span>
                <span className="section-row-value" style={{ color: a.color, fontWeight: 600 }}>
                  {a.dateLabel}
                </span>
              </div>
              <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5 leading-tight">{a.description}</p>
              <div className="mt-1.5" style={{ height: 3, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  width: `${a.progressPct}%`,
                  background: a.color,
                  borderRadius: 2,
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function DashboardView() {
  const navigate = useNavigate();
  const { profile, initials } = useUserProfile();

  const habitsStore    = useHabitsStore();
  const workoutsStore  = useWorkoutsStore();
  const journalStore   = useJournalStore();
  const nutritionStore = useNutritionStore();
  const tasksStore     = useTasksStore();
  const { goal }       = useGoalsStore();

  useEffect(() => {
    if (!habitsStore.loaded)    habitsStore.loadFromStorage();
    if (!workoutsStore.loaded)  workoutsStore.loadFromStorage();
    if (!journalStore.loaded)   journalStore.loadFromStorage();
    if (!nutritionStore.loaded) nutritionStore.loadFromStorage();
    if (!tasksStore.loaded)     tasksStore.loadFromStorage();
  }, []);

  const data = useDashboardData();

  const allLoaded = data.habitsLoaded && data.workoutsLoaded;
  if (!allLoaded) return <DashboardSkeleton />;

  const now   = new Date();
  const hour  = now.getHours();
  const greeting = hour < 13 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';
  const dateStr  = format(now, "EEEE, d 'de' MMMM", { locale: es });

  const todayStr = format(now, 'yyyy-MM-dd');
  const activeHabits    = data.activeHabits;
  const completedToday  = data.habits.filter(h => !h.archivedAt).filter(h => {
    const entry = habitsStore.getEntryForDate(h.id, todayStr);
    return entry && entry.count > 0;
  }).length;
  const habitRate7d = activeHabits.length > 0
    ? Math.round((completedToday / activeHabits.length) * 100)
    : 0;

  const weekStart        = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd          = endOfWeek(now, { weekStartsOn: 1 });
  const workoutsThisWeek = data.workouts.filter(w => {
    try { return isWithinInterval(parseISO(w.date), { start: weekStart, end: weekEnd }); }
    catch { return false; }
  }).length;

  const hasJournalOrTasks = data.journalEntries.length > 0 || data.tasks.length > 0;

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            {greeting}{profile?.name ? `, ${profile.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5 capitalize">{dateStr}</p>
        </div>
        {/* Avatar */}
        <button
          onClick={() => navigate('/settings')}
          className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 touch-compact"
          style={{ background: 'var(--qyro-grad)', minHeight: 'unset' }}
        >
          {initials || '?'}
        </button>
      </div>

      {/* Profile completion nudge */}
      <ProfileCompletionBanner onComplete={() => navigate('/settings')} />

      {/* KPI Band */}
      <KPIBand
        lifeScore={data.lifeScore.today}
        trend7d={data.lifeScore.trend7d}
        habitRate7d={habitRate7d}
        workoutsThisWeek={workoutsThisWeek}
        totalPRs={data.totalPRs}
        totalWorkouts={data.workouts.length}
        last30Days={data.last30Days}
      />

      {/* Today's mood + calorie bar */}
      <div className="space-y-2">
        <TodayMoodCard
          mood={data.todayMood}
          onLog={() => navigate('/journal')}
        />
        {data.caloriesToday !== null && data.calorieTarget !== null && (
          <CalorieBar calories={data.caloriesToday} target={data.calorieTarget} />
        )}
      </div>

      {/* Quick action grid */}
      <div className="grid grid-cols-2 gap-2">
        <QuickLink
          icon={<BookOpen size={14} />}
          label="Diario"
          to="/journal"
          sub={data.journalStreak > 0 ? `${data.journalStreak} días de racha` : 'Sin entradas aún'}
          accent="var(--journal-color, #9333ea)"
        />
        <QuickLink
          icon={<ListTodo size={14} />}
          label="Tareas"
          to="/tasks"
          sub={data.tasksPendingToday > 0 ? `${data.tasksPendingToday} pendientes hoy` : 'Al día ✓'}
          accent="var(--task-color, var(--accent))"
        />
        <QuickLink
          icon={<Utensils size={14} />}
          label="Nutrición"
          to="/nutrition"
          sub={data.caloriesToday !== null ? `${data.caloriesToday} kcal hoy` : 'Sin registro hoy'}
          accent="var(--nutrition-color, var(--warning))"
        />
        <QuickLink
          icon={<Target size={14} />}
          label="Objetivos"
          to="/goals"
          sub={data.avgMood7d !== null ? `Ánimo: ${fmt(data.avgMood7d, { decimals: 1 })}/5` : 'Configura tu objetivo'}
          accent="var(--accent)"
        />
      </div>

      {/* Weekly summary */}
      <WeeklySummaryCard
        weekHabitPct={data.weekHabitPct}
        workoutsThisWeek={workoutsThisWeek}
        workoutTarget={goal?.derived.workoutDaysPerWeek ?? null}
        avgCalories7d={data.avgCalories7d}
        calorieTarget={data.calorieTarget ?? goal?.derived.calorieTarget ?? null}
        avgMood7d={data.avgMood7d}
      />

      {/* Activity Rings */}
      {(activeHabits.length > 0 || data.caloriesToday !== null) && (
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">Actividad hoy</p>
          <ActivityRings
            rings={[
              {
                value: activeHabits.length > 0 ? Math.round((completedToday / activeHabits.length) * 100) : 0,
                color: 'var(--c-habits)',
                label: 'Hábitos',
                sublabel: `${completedToday}/${activeHabits.length} completados`,
              },
              {
                value: (() => {
                  const target = goal?.derived.workoutDaysPerWeek ?? 3;
                  return Math.min(100, Math.round((workoutsThisWeek / target) * 100));
                })(),
                color: 'var(--c-workouts)',
                label: 'Entrenos',
                sublabel: `${workoutsThisWeek} sesiones esta semana`,
              },
              {
                value: data.caloriesToday !== null && data.calorieTarget !== null
                  ? Math.min(100, Math.round((data.caloriesToday / data.calorieTarget) * 100))
                  : 0,
                color: 'var(--c-nutrition)',
                label: 'Nutrición',
                sublabel: data.caloriesToday !== null ? `${data.caloriesToday} kcal` : 'Sin datos',
              },
            ]}
          />
        </div>
      )}

      {/* Life Score section */}
      <LifeScoreSection
        lifeScore={data.lifeScore}
        last30Days={data.last30Days}
      />

      {/* Habits section */}
      {activeHabits.length > 0 && (
        <HabitsSection
          habits={data.habits}
          weekdayCompletion={data.weekdayCompletion}
          streakLeaderboard={data.streakLeaderboard}
          getStats={data.getStatsForHabit}
        />
      )}

      {/* Workouts section */}
      {data.workouts.length > 0 && (
        <WorkoutsSection
          workouts={data.workouts}
          weeklyVolume={data.weeklyVolume}
          totalPRs={data.totalPRs}
        />
      )}

      {/* Achievements */}
      <AchievementsTable />

      {/* Empty state for brand-new users */}
      {activeHabits.length === 0 && data.workouts.length === 0 && !hasJournalOrTasks && (
        <div className="text-center py-12 space-y-2">
          <p className="text-4xl">🚀</p>
          <p className="text-base font-semibold text-[var(--text-primary)]">Empieza tu viaje</p>
          <p className="text-sm text-[var(--text-tertiary)] max-w-xs mx-auto">
            Crea tus primeros hábitos, registra un entrenamiento o define tu objetivo para ver tu dashboard personalizado.
          </p>
        </div>
      )}
    </div>
  );
}
