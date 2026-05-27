import { useMemo } from 'react';
import { format } from 'date-fns';
import { useHabitsStore } from '../../habits/store/habitsStore';
import { useTasksStore } from '../../tasks/store/tasksStore';
import type { Habit, HabitEntry } from '../../habits/types';
import type { Task, TaskPriority } from '../../tasks/types';

export type TodayItemType = 'habit' | 'task';

export interface TodayItem {
  id:        string;
  type:      TodayItemType;
  title:     string;
  emoji:     string;
  color:     string;
  time:      string | null;    // HH:MM or null
  completed: boolean;
  priority:  'none' | TaskPriority;
  isOverdue: boolean;

  // Habit-specific
  habit?:      Habit;
  habitEntry?: HabitEntry;

  // Task-specific
  task?: Task;
}

export interface TodayStats {
  totalHabits:     number;
  completedHabits: number;
  totalTasks:      number;
  completedTasks:  number;
  overallPct:      number;
}

const PRIORITY_EMOJI: Record<TaskPriority, string> = {
  low:    '🔵',
  medium: '📋',
  high:   '🔴',
  urgent: '🚨',
};

const PRIORITY_COLOR: Record<TaskPriority, string> = {
  low:    'var(--text-tertiary)',
  medium: 'var(--c-tasks)',
  high:   'var(--danger)',
  urgent: 'var(--danger)',
};

function isHabitDoneToday(habit: Habit, entry: HabitEntry | undefined): boolean {
  if (!entry || entry.skipped) return false;
  if (habit.type === 'count') return entry.count >= (habit.targetCount ?? 1);
  return entry.count > 0;
}

export function useTodayItems() {
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const habits      = useHabitsStore(s => s.habits);
  const entries     = useHabitsStore(s => s.entries);
  const habitsLoaded = useHabitsStore(s => s.loaded);

  const tasks      = useTasksStore(s => s.tasks);
  const tasksLoaded = useTasksStore(s => s.loaded);

  const loaded = habitsLoaded && tasksLoaded;

  const allItems: TodayItem[] = useMemo(() => {
    const items: TodayItem[] = [];

    // ── Habits ────────────────────────────────────────────────────────────────
    const activeHabits = habits.filter(h => !h.archivedAt);
    for (const habit of activeHabits) {
      // Only include habits scheduled for today
      const { type, days } = habit.frequency;
      const dayOfWeek = new Date().getDay(); // 0 = Sunday

      const scheduledToday =
        type === 'daily' ||
        (type === 'weekly' && days.includes(dayOfWeek)) ||
        (type === 'times_per_week' && days.includes(dayOfWeek));

      if (!scheduledToday) continue;

      const entry    = entries.find(e => e.habitId === habit.id && e.date === todayStr);
      const completed = isHabitDoneToday(habit, entry);

      items.push({
        id:         `habit_${habit.id}`,
        type:       'habit',
        title:      habit.name,
        emoji:      habit.emoji,
        color:      habit.color,
        time:       habit.schedule?.enabled && habit.schedule.time ? habit.schedule.time : null,
        completed,
        priority:   'none',
        isOverdue:  false,
        habit,
        habitEntry: entry,
      });
    }

    // ── Tasks ─────────────────────────────────────────────────────────────────
    const activeTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'archived');
    for (const task of activeTasks) {
      const dueToday   = task.dueDate === todayStr;
      const overdue    = !!task.dueDate && task.dueDate < todayStr;
      const inProgress = task.status === 'in_progress';

      if (!dueToday && !overdue && !inProgress) continue;

      items.push({
        id:        `task_${task.id}`,
        type:      'task',
        title:     task.title,
        emoji:     PRIORITY_EMOJI[task.priority],
        color:     PRIORITY_COLOR[task.priority],
        time:      null,
        completed: false,
        priority:  task.priority,
        isOverdue: overdue,
        task,
      });
    }

    return items;
  }, [habits, entries, tasks, todayStr]);

  const incomplete  = allItems.filter(i => !i.completed);
  const completed   = allItems.filter(i => i.completed);
  const scheduled   = incomplete.filter(i => i.time !== null).sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''));
  const unscheduled = incomplete.filter(i => i.time === null);

  const totalHabits     = allItems.filter(i => i.type === 'habit').length;
  const completedHabits = allItems.filter(i => i.type === 'habit' && i.completed).length;
  const totalTasks      = allItems.filter(i => i.type === 'task').length;
  const completedTasks  = 0; // tasks shown here are always incomplete
  const totalAll        = totalHabits + totalTasks;

  const stats: TodayStats = {
    totalHabits,
    completedHabits,
    totalTasks,
    completedTasks,
    overallPct: totalAll > 0
      ? Number(((completedHabits / totalAll) * 100).toFixed(1))
      : 0,
  };

  return { scheduled, unscheduled, completed, stats, loaded };
}
