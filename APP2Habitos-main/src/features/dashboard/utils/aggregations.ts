import { format, subDays, eachDayOfInterval, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Habit, HabitEntry } from '../../habits/types';
import type { Workout } from '../../workouts/types';

export interface DayScore {
  date: string;
  habitsScore: number;
  workoutScore: number;
  total: number;
}

export interface LifeScore {
  today: number;
  trend7d: number;
  components: {
    habits: number;
    workout: number;
    nutrition: number;
    journal: number;
    tasks: number;
  };
}

const WEIGHTS = {
  habits: 0.35,
  workout: 0.25,
  nutrition: 0.20,
  journal: 0.10,
  tasks: 0.10,
};

export function computeDailyHabitScore(
  date: string,
  habits: Habit[],
  entries: HabitEntry[],
): number {
  const dayEntries = entries.filter(e => e.date === date);
  const scheduled = habits.filter(h => !h.archivedAt);
  if (scheduled.length === 0) return 0;
  const completed = dayEntries.filter(e => e.count > 0).length;
  return Math.min(100, Math.round((completed / scheduled.length) * 100));
}

export function computeDailyWorkoutScore(date: string, workouts: Workout[]): number {
  const week = { start: startOfWeek(parseISO(date), { weekStartsOn: 1 }), end: endOfWeek(parseISO(date), { weekStartsOn: 1 }) };
  const weekWorkouts = workouts.filter(w => {
    try { return isWithinInterval(parseISO(w.date), week); } catch { return false; }
  });
  // 3+ workouts/week = 100, scaled down
  return Math.min(100, Math.round((weekWorkouts.length / 3) * 100));
}

export function computeLifeScore(
  habits: Habit[],
  entries: HabitEntry[],
  workouts: Workout[],
): LifeScore {
  const today = format(new Date(), 'yyyy-MM-dd');
  const habitsScore = computeDailyHabitScore(today, habits, entries);
  const workoutScore = computeDailyWorkoutScore(today, workouts);

  const components = {
    habits: habitsScore,
    workout: workoutScore,
    nutrition: 0,
    journal: 0,
    tasks: 0,
  };

  const todayScore = Math.round(
    components.habits * WEIGHTS.habits +
    components.workout * WEIGHTS.workout +
    components.nutrition * WEIGHTS.nutrition +
    components.journal * WEIGHTS.journal +
    components.tasks * WEIGHTS.tasks,
  );

  // 7-day trend: compare this week avg vs last week avg
  const last14Days = getLast14DayScores(habits, entries, workouts);
  const thisWeek = last14Days.slice(7).reduce((s, d) => s + d.total, 0) / 7;
  const lastWeek = last14Days.slice(0, 7).reduce((s, d) => s + d.total, 0) / 7;
  const trend7d = Math.round(thisWeek - lastWeek);

  return { today: todayScore, trend7d, components };
}

function getLast14DayScores(habits: Habit[], entries: HabitEntry[], workouts: Workout[]): DayScore[] {
  const days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });
  return days.map(d => {
    const date = format(d, 'yyyy-MM-dd');
    const habitsScore = computeDailyHabitScore(date, habits, entries);
    const workoutScore = computeDailyWorkoutScore(date, workouts);
    const total = Math.round(habitsScore * WEIGHTS.habits + workoutScore * WEIGHTS.workout);
    return { date, habitsScore, workoutScore, total };
  });
}

export function getLast30DayScores(habits: Habit[], entries: HabitEntry[], workouts: Workout[]): DayScore[] {
  const days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() });
  return days.map(d => {
    const date = format(d, 'yyyy-MM-dd');
    const habitsScore = computeDailyHabitScore(date, habits, entries);
    const workoutScore = computeDailyWorkoutScore(date, workouts);
    const total = Math.round(habitsScore * WEIGHTS.habits + workoutScore * WEIGHTS.workout);
    return { date, habitsScore, workoutScore, total };
  });
}

export function getHabitCompletionByWeekday(
  habits: Habit[],
  entries: HabitEntry[],
  days = 90,
): { day: string; rate: number }[] {
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const counts = Array(7).fill(0).map(() => ({ completed: 0, total: 0 }));

  eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() }).forEach(d => {
    const dow = d.getDay();
    const date = format(d, 'yyyy-MM-dd');
    const scheduled = habits.filter(h => !h.archivedAt).length;
    if (scheduled === 0) return;
    const completed = entries.filter(e => e.date === date && e.count > 0).length;
    counts[dow].total += scheduled;
    counts[dow].completed += completed;
  });

  return counts.map((c, i) => ({
    day: dayNames[i],
    rate: c.total > 0 ? Math.round((c.completed / c.total) * 100) : 0,
  }));
}

export function getWorkoutVolumeByWeek(workouts: Workout[], weeks = 8): { week: string; volume: number; count: number }[] {
  const result: { week: string; volume: number; count: number }[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = startOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subDays(new Date(), i * 7), { weekStartsOn: 1 });
    const weekWorkouts = workouts.filter(w => {
      try { return isWithinInterval(parseISO(w.date), { start: weekStart, end: weekEnd }); } catch { return false; }
    });
    result.push({
      week: format(weekStart, 'd MMM', { locale: es }),
      volume: Math.round(weekWorkouts.reduce((s, w) => s + w.totalVolume, 0)),
      count: weekWorkouts.length,
    });
  }
  return result;
}

export function getStreakLeaderboard(
  habits: Habit[],
  getStats: (id: string) => { currentStreak: number; longestStreak: number; completionRate30d: number },
): { habit: Habit; currentStreak: number; longestStreak: number; rate: number }[] {
  return habits
    .filter(h => !h.archivedAt)
    .map(h => ({ habit: h, ...getStats(h.id), rate: getStats(h.id).completionRate30d }))
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, 5);
}
