import { useEffect, useMemo } from 'react';
import { format, subDays, parseISO, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Cell,
  XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine,
} from 'recharts';
import { BarChart2, Trophy, TrendingUp, Scale, Flame, Brain, Activity } from 'lucide-react';
import { fmt } from '../../../shared/utils/fmt';
import { useHabitsStore }    from '../../habits/store/habitsStore';
import { useWorkoutsStore }  from '../../workouts/store/workoutsStore';
import { useNutritionStore } from '../../nutrition/store/nutritionStore';
import { useNutritionTargets } from '../../nutrition/hooks/useNutritionTargets';
import { useJournalStore }   from '../../journal/store/journalStore';
import { useTasksStore }     from '../../tasks/store/tasksStore';
import { EXERCISE_MAP }      from '../../workouts/data/exercises';
import { Skeleton }          from '../../../shared/components/ui';
import { MoodDot }           from '../../journal/components/MoodPicker';
import type { Mood }         from '../../journal/types';

// ─── Shared chart styles ──────────────────────────────────────────────────────
const TOOLTIP_STYLE = {
  background: 'var(--bg-surface)',
  border:     '1px solid var(--border-default)',
  borderRadius: 8,
  fontSize:   11,
  color:      'var(--text-primary)',
};
const TICK_PROPS = { fontSize: 9, fill: 'var(--text-tertiary)' };

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="text-[var(--accent)]">{icon}</div>
      <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
    </div>
  );
}

function ChartBox({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4 ${className}`}>
      {children}
    </div>
  );
}

// ─── 1. Life Polar Score ──────────────────────────────────────────────────────
function PolarScoreChart({ scores }: { scores: { subject: string; value: number; fullMark: number }[] }) {
  return (
    <ChartBox>
      <SectionTitle icon={<Activity size={14} />} title="Life Score por área" />
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={scores} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="var(--border-subtle)" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
          <Radar
            name="Score"
            dataKey="value"
            stroke="var(--accent)"
            fill="var(--accent)"
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, 'Score']} />
        </RadarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

// ─── 2. Mood Calendar heatmap ─────────────────────────────────────────────────
function MoodCalendarHeatmap({ calendar }: { calendar: { date: string; mood: Mood | null }[] }) {
  // group by week rows
  const weeks: { date: string; mood: Mood | null }[][] = [];
  for (let i = 0; i < calendar.length; i += 7) {
    weeks.push(calendar.slice(i, i + 7));
  }
  const dayLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

  return (
    <ChartBox>
      <SectionTitle icon={<Brain size={14} />} title="Calendario de ánimo — 56 días" />
      <div className="flex gap-1.5">
        <div className="flex flex-col gap-1.5 pt-5">
          {dayLabels.map(d => (
            <div key={d} className="h-5 flex items-center">
              <span className="text-[9px] text-[var(--text-tertiary)] w-3">{d}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1.5">
              <span className="text-[9px] text-[var(--text-tertiary)] h-4 flex items-end">
                {wi % 2 === 0 ? format(parseISO(week[0].date), 'd MMM', { locale: es }) : ''}
              </span>
              {week.map(({ date, mood }) => (
                <div
                  key={date}
                  title={`${format(parseISO(date), 'd MMM', { locale: es })}${mood ? ` · ánimo ${mood}/5` : ''}`}
                  className="w-5 h-5 rounded-sm"
                  style={{
                    backgroundColor: mood ? undefined : 'var(--bg-hover)',
                  }}
                >
                  {mood && <MoodDot mood={mood} size={20} />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        {([1, 2, 3, 4, 5] as Mood[]).map(m => (
          <div key={m} className="flex items-center gap-1">
            <MoodDot mood={m} size={10} />
            <span className="text-[9px] text-[var(--text-tertiary)]">{m}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 ml-auto">
          <div className="w-2.5 h-2.5 rounded-sm bg-[var(--bg-hover)]" />
          <span className="text-[9px] text-[var(--text-tertiary)]">Sin registro</span>
        </div>
      </div>
    </ChartBox>
  );
}

// ─── 3. Weight trend + forecast ───────────────────────────────────────────────
function WeightForecastChart({ data }: { data: { date: string; label: string; weight?: number; forecast?: number }[] }) {
  if (data.length === 0) return null;
  return (
    <ChartBox>
      <SectionTitle icon={<Scale size={14} />} title="Peso corporal + previsión 14 días" />
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
          <CartesianGrid stroke="var(--border-subtle)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" tick={TICK_PROPS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={TICK_PROPS} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${fmt(v, { decimals: 1 })} kg`]} />
          <Area type="monotone" dataKey="weight"   stroke="var(--accent)"  fill="var(--accent)"  fillOpacity={0.15} strokeWidth={2} dot={false} connectNulls />
          <Area type="monotone" dataKey="forecast" stroke="var(--warning)" fill="var(--warning)" fillOpacity={0.08} strokeWidth={1.5} strokeDasharray="4 3" dot={false} connectNulls />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2">
        {[['var(--accent)', 'Real'], ['var(--warning)', 'Previsión (tendencia)']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-4 h-0.5 rounded" style={{ backgroundColor: color }} />
            <span className="text-[9px] text-[var(--text-tertiary)]">{label}</span>
          </div>
        ))}
      </div>
    </ChartBox>
  );
}

// ─── 4. PR Timeline ───────────────────────────────────────────────────────────
interface PREntry { date: string; label: string; exercise: string; value: number; type: string }

function PRTimeline({ prs }: { prs: PREntry[] }) {
  if (prs.length === 0) return null;
  return (
    <ChartBox>
      <SectionTitle icon={<Trophy size={14} />} title="Línea de tiempo de marcas personales" />
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 w-px bg-[var(--border-subtle)]" />
        <div className="space-y-3 pl-8">
          {prs.slice(0, 10).map((pr, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-5 top-1 w-3 h-3 rounded-full border-2 border-[var(--warning)] bg-[var(--bg-base)]" />
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-[var(--text-primary)]">{pr.exercise}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">{pr.label} · {pr.type}</p>
                </div>
                <span className="text-sm font-bold text-[var(--warning)] shrink-0">
                  {fmt(pr.value, { decimals: pr.type === '1RM' ? 1 : 0 })}{pr.type === 'reps' ? ' reps' : ' kg'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ChartBox>
  );
}

// ─── 5. Protein adequacy ──────────────────────────────────────────────────────
function ProteinAdequacyChart({ data, target }: {
  data: { label: string; protein: number }[];
  target: number;
}) {
  if (data.every(d => d.protein === 0)) return null;
  return (
    <ChartBox>
      <SectionTitle icon={<TrendingUp size={14} />} title={`Proteína diaria vs objetivo (${target}g)`} />
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
          <XAxis dataKey="label" tick={TICK_PROPS} tickLine={false} axisLine={false} interval={1} />
          <YAxis tick={TICK_PROPS} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}g`, 'Proteína']} />
          <ReferenceLine y={target} stroke="var(--accent)" strokeDasharray="4 3" strokeWidth={1.5} />
          <Bar
            dataKey="protein"
            radius={[3, 3, 0, 0]}
            fill="var(--accent)"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

// ─── 6. Calorie adherence streak chart ────────────────────────────────────────
function CalorieAdherenceChart({ data, target }: {
  data: { label: string; calories: number; deviation: number }[];
  target: number;
}) {
  if (data.every(d => d.calories === 0)) return null;
  return (
    <ChartBox>
      <SectionTitle icon={<Flame size={14} />} title={`Calorías — adherencia al objetivo (${target} kcal)`} />
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
          <XAxis dataKey="label" tick={TICK_PROPS} tickLine={false} axisLine={false} interval={1} />
          <YAxis tick={TICK_PROPS} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(v: number, name: string) => [
              name === 'deviation' ? `${v > 0 ? '+' : ''}${v} kcal vs objetivo` : `${v} kcal`,
              name === 'deviation' ? 'Desviación' : 'Calorías',
            ]}
          />
          <ReferenceLine y={0} stroke="var(--border-default)" strokeWidth={1} />
          <Bar dataKey="deviation" radius={[3, 3, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.deviation > 0 ? 'var(--warning)' : 'var(--success)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[9px] text-[var(--text-tertiary)] mt-1">Verde = bajo objetivo · Naranja = sobre objetivo</p>
    </ChartBox>
  );
}

// ─── 7. Workout volume trend ──────────────────────────────────────────────────
function WorkoutVolumeTrend({ data }: { data: { label: string; volume: number; sessions: number }[] }) {
  if (data.length === 0) return null;
  return (
    <ChartBox>
      <SectionTitle icon={<BarChart2 size={14} />} title="Volumen de entrenamiento (30 días)" />
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
          <XAxis dataKey="label" tick={TICK_PROPS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={TICK_PROPS} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v.toLocaleString()} kg`, 'Volumen']} />
          <Bar dataKey="volume" fill="var(--workout-color, var(--accent))" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

// ─── 8. Habit completion rate ─────────────────────────────────────────────────
function HabitCompletionChart({ data }: { data: { label: string; pct: number }[] }) {
  if (data.length === 0) return null;
  return (
    <ChartBox>
      <SectionTitle icon={<Activity size={14} />} title="Tasa de cumplimiento de hábitos (30 días)" />
      <ResponsiveContainer width="100%" height={130}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: -24, bottom: 0 }}>
          <XAxis dataKey="label" tick={TICK_PROPS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={TICK_PROPS} tickLine={false} axisLine={false} domain={[0, 100]} unit="%" />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => [`${v}%`, 'Cumplimiento']} />
          <ReferenceLine y={70} stroke="var(--success)" strokeDasharray="3 3" strokeWidth={1} />
          <Area type="monotone" dataKey="pct" stroke="var(--success)" fill="var(--success)" fillOpacity={0.15} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartBox>
  );
}

// ─── Summary stat cards ───────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'var(--accent)' }: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-3 text-center">
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
      <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{label}</p>
      {sub && <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5 opacity-70">{sub}</p>}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export default function AnalyticsView() {
  const { habits, entries: habitEntries, loaded: habitsLoaded, loadFromStorage: loadHabits } = useHabitsStore();
  const { workouts, loaded: workoutsLoaded, loadFromStorage: loadWorkouts } = useWorkoutsStore();
  const { getTotalsForDate, getBodyWeightTrend, loaded: nutritionLoaded, loadFromStorage: loadNutrition } = useNutritionStore();
  const targets = useNutritionTargets();
  const { entries: journalEntries, loaded: journalLoaded, loadFromStorage: loadJournal, getMoodCalendar } = useJournalStore();
  const { tasks, loaded: tasksLoaded, loadFromStorage: loadTasks } = useTasksStore();

  useEffect(() => {
    if (!habitsLoaded)    loadHabits();
    if (!workoutsLoaded)  loadWorkouts();
    if (!nutritionLoaded) loadNutrition();
    if (!journalLoaded)   loadJournal();
    if (!tasksLoaded)     loadTasks();
  }, [habitsLoaded, workoutsLoaded, nutritionLoaded, journalLoaded, tasksLoaded,
      loadHabits, loadWorkouts, loadNutrition, loadJournal, loadTasks]);

  const allLoaded = habitsLoaded && workoutsLoaded && nutritionLoaded && journalLoaded && tasksLoaded;

  // ── Polar score ─────────────────────────────────────────────────────────────
  const polarScores = useMemo(() => {
    const today  = format(new Date(), 'yyyy-MM-dd');
    const cutoff = format(subDays(new Date(), 7), 'yyyy-MM-dd');

    // Habits score (0-100): % completed this week
    const totalPossible = habits.length * 7;
    const completed     = habitEntries.filter(e => e.date >= cutoff && e.count > 0).length;
    const habitsScore   = totalPossible > 0 ? Math.round((completed / totalPossible) * 100) : 0;

    // Workout score: sessions this week vs 3 target
    const workoutsThisWeek = workouts.filter(w => w.date >= cutoff && w.date <= today).length;
    const workoutScore = Math.min(100, Math.round((workoutsThisWeek / 3) * 100));

    // Nutrition score: days in calorie range
    const calTarget = targets?.calories ?? 2000;
    const nutritionDays = Array.from({ length: 7 }, (_, i) => {
      const d     = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const total = getTotalsForDate(d).calories;
      return total > 0 && Math.abs(total - calTarget) < calTarget * 0.15;
    }).filter(Boolean).length;
    const nutritionScore = Math.round((nutritionDays / 7) * 100);

    // Journal score: entries this week
    const journalThisWeek = journalEntries.filter(e => e.date >= cutoff && e.date <= today).length;
    const journalScore    = Math.min(100, Math.round((journalThisWeek / 5) * 100));

    // Tasks score: completion rate
    const tasksDone    = tasks.filter(t => t.status === 'done').length;
    const tasksTotal   = tasks.length;
    const tasksScore   = tasksTotal > 0 ? Math.min(100, Math.round((tasksDone / tasksTotal) * 100)) : 0;

    // Mood score: avg mood * 20
    const recentMoods = journalEntries
      .filter(e => e.date >= cutoff && e.mood != null)
      .map(e => e.mood!);
    const moodScore = recentMoods.length > 0
      ? Math.round((recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length / 5) * 100)
      : 0;

    return [
      { subject: 'Hábitos',    value: habitsScore,   fullMark: 100 },
      { subject: 'Entrenos',   value: workoutScore,   fullMark: 100 },
      { subject: 'Nutrición',  value: nutritionScore, fullMark: 100 },
      { subject: 'Diario',     value: journalScore,   fullMark: 100 },
      { subject: 'Tareas',     value: tasksScore,     fullMark: 100 },
      { subject: 'Ánimo',      value: moodScore,      fullMark: 100 },
    ];
  }, [habits, habitEntries, workouts, journalEntries, tasks, targets, getTotalsForDate]);

  // ── Mood calendar ────────────────────────────────────────────────────────────
  const moodCalendar = useMemo(() => getMoodCalendar(56), [journalEntries]);

  // ── Weight forecast ──────────────────────────────────────────────────────────
  const weightData = useMemo(() => {
    const history = getBodyWeightTrend(60);
    if (history.length < 2) return [];

    // Simple linear regression for forecast
    const xs = history.map((_, i) => i);
    const ys = history.map(e => e.weight);
    const n  = xs.length;
    const sx = xs.reduce((a, b) => a + b, 0);
    const sy = ys.reduce((a, b) => a + b, 0);
    const sxy = xs.reduce((a, i) => a + i * ys[i], 0);
    const sxx = xs.reduce((a, b) => a + b * b, 0);
    const slope     = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    const intercept = (sy - slope * sx) / n;

    const result: { date: string; label: string; weight?: number; forecast?: number }[] = history.map((e) => ({
      date:   e.date,
      label:  format(parseISO(e.date), 'd MMM', { locale: es }),
      weight: e.weight,
    }));

    // Add 14 forecast days
    const lastDate = parseISO(history[history.length - 1].date);
    for (let i = 1; i <= 14; i++) {
      const d   = addDays(lastDate, i);
      const idx = history.length - 1 + i;
      result.push({
        date:     format(d, 'yyyy-MM-dd'),
        label:    format(d, 'd MMM', { locale: es }),
        forecast: Math.max(0, parseFloat((slope * idx + intercept).toFixed(1))),
      });
    }
    return result;
  }, [getBodyWeightTrend]);

  // ── PR Timeline ──────────────────────────────────────────────────────────────
  const prTimeline = useMemo((): PREntry[] => {
    const all: PREntry[] = [];
    for (const w of workouts) {
      for (const pr of w.prs) {
        const name = EXERCISE_MAP.get(pr.exerciseId)?.name ?? pr.exerciseId;
        all.push({
          date:     w.date,
          label:    format(parseISO(w.date), 'd MMM yy', { locale: es }),
          exercise: name,
          value:    pr.value,
          type:     pr.type,
        });
      }
    }
    return all.sort((a, b) => b.date.localeCompare(a.date));
  }, [workouts]);

  // ── Protein + calorie daily data ─────────────────────────────────────────────
  const last14Days = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => {
      const d = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd');
      const totals = getTotalsForDate(d);
      return {
        label:    format(parseISO(d), 'd/M'),
        protein:  Math.round(totals.protein),
        calories: Math.round(totals.calories),
        deviation: Math.round(totals.calories - (targets?.calories ?? 2000)),
      };
    }),
    [getTotalsForDate, targets]
  );

  // ── Workout volume by week ────────────────────────────────────────────────────
  const workoutVolume = useMemo(() => {
    const cutoff = format(subDays(new Date(), 29), 'yyyy-MM-dd');
    const byDate = new Map<string, number>();
    for (const w of workouts.filter(w => w.date >= cutoff)) {
      byDate.set(w.date, (byDate.get(w.date) ?? 0) + w.totalVolume);
    }
    return Array.from({ length: 30 }, (_, i) => {
      const d = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
      return {
        label:    format(parseISO(d), 'd/M'),
        volume:   byDate.get(d) ?? 0,
        sessions: byDate.has(d) ? 1 : 0,
      };
    }).filter(d => d.volume > 0);
  }, [workouts]);

  // ── Habit completion 30 days ──────────────────────────────────────────────────
  const habitCompletion = useMemo(() => {
    const habitCount = habits.length;
    if (habitCount === 0) return [];
    return Array.from({ length: 30 }, (_, i) => {
      const d = format(subDays(new Date(), 29 - i), 'yyyy-MM-dd');
      const completed = habitEntries.filter(e => e.date === d && e.count > 0).length;
      return {
        label: format(parseISO(d), 'd/M'),
        pct:   Math.round((completed / habitCount) * 100),
      };
    });
  }, [habits, habitEntries]);

  // ── Summary stats ─────────────────────────────────────────────────────────────
  const summaryStats = useMemo(() => {
    const today  = format(new Date(), 'yyyy-MM-dd');
    const cutoff = format(subDays(new Date(), 29), 'yyyy-MM-dd');
    const workoutsThisMonth = workouts.filter(w => w.date >= cutoff && w.date <= today).length;
    const totalVolume = workouts
      .filter(w => w.date >= cutoff)
      .reduce((s, w) => s + w.totalVolume, 0);
    const avgCalories = last14Days
      .filter(d => d.calories > 0)
      .reduce((s, d, _, a) => s + d.calories / a.length, 0);
    const tasksDone = tasks.filter(t => t.status === 'done').length;
    const avgMoodRaw = journalEntries
      .filter(e => e.date >= cutoff && e.mood != null)
      .reduce((s, e, _, a) => s + (e.mood ?? 0) / a.length, 0);

    return {
      workoutsThisMonth,
      totalVolume:  Math.round(totalVolume / 1000),
      avgCalories:  avgCalories > 0 ? Math.round(avgCalories) : null,
      tasksDone,
      avgMood:      avgMoodRaw > 0 ? fmt(avgMoodRaw, { decimals: 1 }) : null,
      journalDays:  new Set(journalEntries.filter(e => e.date >= cutoff).map(e => e.date)).size,
    };
  }, [workouts, last14Days, tasks, journalEntries]);

  const hasAnyData = workouts.length > 0 || habits.length > 0 || journalEntries.length > 0;

  if (!allLoaded) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-56 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!hasAnyData) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-6">Analytics</h1>
        <div className="text-center py-16">
          <BarChart2 size={32} className="mx-auto text-[var(--text-tertiary)] mb-3" />
          <p className="text-sm font-medium text-[var(--text-primary)]">Sin datos aún</p>
          <p className="text-xs text-[var(--text-tertiary)] mt-1 max-w-xs mx-auto">
            Usa la app durante unos días para ver tus patrones, tendencias y correlaciones entre hábitos, entrenos, nutrición y estado de ánimo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 space-y-5">
      <h1 className="text-xl font-semibold text-[var(--text-primary)]">Analytics</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Entrenos 30d" value={summaryStats.workoutsThisMonth} color="var(--workout-color, var(--accent))" />
        <StatCard label="Volumen total" value={`${summaryStats.totalVolume}t`} sub="toneladas" color="var(--accent)" />
        <StatCard label="Días de diario" value={summaryStats.journalDays} color="var(--journal-color, #9333ea)" />
        {summaryStats.avgCalories && (
          <StatCard label="Kcal media" value={summaryStats.avgCalories} sub="últimos 14 días" color="var(--nutrition-color, var(--warning))" />
        )}
        <StatCard label="Tareas hechas" value={summaryStats.tasksDone} color="var(--success)" />
        {summaryStats.avgMood && (
          <StatCard label="Ánimo medio" value={summaryStats.avgMood} sub="últimos 30 días" color="var(--accent)" />
        )}
      </div>

      {/* Life polar score */}
      <PolarScoreChart scores={polarScores} />

      {/* Mood calendar */}
      {journalEntries.length > 0 && <MoodCalendarHeatmap calendar={moodCalendar} />}

      {/* Weight forecast */}
      {weightData.length > 0 && <WeightForecastChart data={weightData} />}

      {/* PR Timeline */}
      {prTimeline.length > 0 && <PRTimeline prs={prTimeline} />}

      {/* Protein adequacy */}
      {targets?.protein && (
        <ProteinAdequacyChart
          data={last14Days}
          target={targets.protein}
        />
      )}

      {/* Calorie adherence */}
      {targets?.calories && (
        <CalorieAdherenceChart
          data={last14Days}
          target={targets.calories}
        />
      )}

      {/* Workout volume trend */}
      {workoutVolume.length > 0 && <WorkoutVolumeTrend data={workoutVolume} />}

      {/* Habit completion */}
      {habitCompletion.length > 0 && <HabitCompletionChart data={habitCompletion} />}
    </div>
  );
}
