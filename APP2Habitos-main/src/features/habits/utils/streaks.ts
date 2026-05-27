import { format, subDays, parseISO } from 'date-fns';
import type { Habit, HabitEntry, HabitStats } from '../types';

function isScheduledOnDate(habit: Habit, date: Date): boolean {
  const day = date.getDay();
  if (habit.frequency.type === 'daily') return true;
  if (habit.frequency.type === 'weekly') return habit.frequency.days.includes(day);
  return true; // times_per_week: treat as daily for streak purposes
}

export function calculateStreaks(
  habit: Habit,
  entries: HabitEntry[]
): { current: number; longest: number } {
  const done = new Set(entries.filter(e => !e.skipped && e.count > 0).map(e => e.date));
  const today = new Date();
  let current = 0;
  let longest = 0;
  let run = 0;
  let finishedCurrent = false;

  for (let i = 0; i < 365; i++) {
    const d = subDays(today, i);
    const ds = format(d, 'yyyy-MM-dd');
    if (!isScheduledOnDate(habit, d)) continue;

    if (done.has(ds)) {
      run++;
      longest = Math.max(longest, run);
      if (!finishedCurrent) current = run;
    } else {
      if (i === 0) continue; // today not done yet — don't penalise
      finishedCurrent = true;
      run = 0;
    }
  }

  return { current, longest };
}

export function calculateHabitStats(habit: Habit, entries: HabitEntry[]): HabitStats {
  const { current, longest } = calculateStreaks(habit, entries);
  const done = entries.filter(e => !e.skipped && e.count > 0);
  const now = new Date();

  const last30 = Array.from({ length: 30 }, (_, i) => format(subDays(now, i), 'yyyy-MM-dd'));
  const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(now, i), 'yyyy-MM-dd'));

  const doneSet = new Set(done.map(e => e.date));
  const done30 = last30.filter(d => doneSet.has(d)).length;
  const done7 = last7.filter(d => doneSet.has(d)).length;

  const sched30 = last30.filter(d => isScheduledOnDate(habit, parseISO(d))).length;
  const sched7 = last7.filter(d => isScheduledOnDate(habit, parseISO(d))).length;

  const sorted = [...done].sort((a, b) => b.date.localeCompare(a.date));

  return {
    habitId: habit.id,
    currentStreak: current,
    longestStreak: longest,
    totalCompletions: done.length,
    completionRate30d: sched30 > 0 ? done30 / sched30 : 0,
    completionRate7d: sched7 > 0 ? done7 / sched7 : 0,
    lastCompletedDate: sorted[0]?.date ?? null,
  };
}
