import { format, subDays } from 'date-fns';
import type { ToolCall, ToolResult } from './tools';
import type { Habit } from '../habits/types';

type HabitsStore = {
  habits: Habit[];
  entries: { habitId: string; date: string; count: number }[];
  addHabit: (d: Omit<Habit, 'id' | 'createdAt' | 'order'>) => Promise<Habit>;
  updateHabit: (id: string, patch: Partial<Omit<Habit, 'id' | 'createdAt'>>) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  markComplete: (id: string, opts?: { date?: string; note?: string; count?: number }) => Promise<void>;
  getStatsForHabit: (id: string) => { currentStreak: number; longestStreak: number; completionRate30d: number; completionRate7d: number } | null;
};

type WorkoutsStore = {
  workouts: { date: string; name: string; totalVolume: number; prs: { exerciseId: string; value: number }[] }[];
};

type NutritionStore = {
  getTotalsForDate: (d: string) => { calories: number; protein: number; carbs: number; fat: number };
  targets: { calories: number; protein: number } | null;
  bodyWeight: { date: string; weight: number }[];
};

function buildHabitData(input: Record<string, unknown>): Omit<Habit, 'id' | 'createdAt' | 'order'> {
  const freqType = (input.frequency_type as string) ?? 'daily';
  return {
    name:        String(input.name ?? ''),
    emoji:       String(input.emoji ?? '✅'),
    description: input.description ? String(input.description) : undefined,
    color:       String(input.color ?? '#007aff'),
    category:    (input.category as Habit['category']) ?? 'other',
    frequency: {
      type: freqType as Habit['frequency']['type'],
      days: freqType === 'weekly'
        ? (input.frequency_days as number[] | undefined) ?? [1, 3, 5]
        : [0, 1, 2, 3, 4, 5, 6],
      timesPerWeek: freqType === 'times_per_week'
        ? Number(input.frequency_times ?? 3)
        : null,
    },
    schedule: input.schedule_time ? {
      enabled:     true,
      time:        String(input.schedule_time),
      duration:    input.schedule_duration ? Number(input.schedule_duration) : null,
      flexibility: 'window' as const,
      windowEnd:   null,
      reminders:   { enabled: false, minutesBefore: 15 },
    } : null,
    type:        (input.type as 'boolean' | 'count') ?? 'boolean',
    targetCount: input.target_count ? Number(input.target_count) : null,
    unit:        input.unit ? String(input.unit) : null,
    difficulty:  (input.difficulty as Habit['difficulty']) ?? 'medium',
    identity:    input.identity ? String(input.identity) : undefined,
    linkedHabitId: null,
    archivedAt:  null,
  };
}

export async function executeToolCall(
  call: ToolCall,
  habitsStore: HabitsStore,
  workoutsStore: WorkoutsStore,
  nutritionStore: NutritionStore,
): Promise<ToolResult> {
  const { id, name, input } = call;

  try {
    switch (name) {
      case 'create_habit': {
        const habit = await habitsStore.addHabit(buildHabitData(input));
        return { tool_use_id: id, content: JSON.stringify({ success: true, habit_id: habit.id, message: `Hábito "${habit.name}" creado correctamente.` }) };
      }

      case 'bulk_create_habits': {
        const habitList = input.habits as Record<string, unknown>[];
        const created: string[] = [];
        for (const h of habitList) {
          const habit = await habitsStore.addHabit(buildHabitData(h));
          created.push(habit.name);
        }
        return { tool_use_id: id, content: JSON.stringify({ success: true, created_count: created.length, names: created, plan_summary: input.plan_summary }) };
      }

      case 'update_habit': {
        const habitId = String(input.habit_id);
        const patch: Partial<Omit<Habit, 'id' | 'createdAt'>> = {};
        if (input.name) patch.name = String(input.name);
        if (input.emoji) patch.emoji = String(input.emoji);
        if (input.description !== undefined) patch.description = String(input.description);
        if (input.color) patch.color = String(input.color);
        if (input.difficulty) patch.difficulty = input.difficulty as Habit['difficulty'];
        if (input.identity !== undefined) patch.identity = String(input.identity);
        if (input.target_count !== undefined) patch.targetCount = Number(input.target_count);
        if (input.schedule_time) {
          const existing = habitsStore.habits.find(h => h.id === habitId);
          patch.schedule = {
            enabled: true,
            time: String(input.schedule_time),
            duration: input.schedule_duration ? Number(input.schedule_duration) : (existing?.schedule?.duration ?? null),
            flexibility: 'window',
            windowEnd: null,
            reminders: existing?.schedule?.reminders ?? { enabled: false, minutesBefore: 15 },
          };
        }
        await habitsStore.updateHabit(habitId, patch);
        return { tool_use_id: id, content: JSON.stringify({ success: true, message: 'Hábito actualizado.' }) };
      }

      case 'archive_habit': {
        await habitsStore.archiveHabit(String(input.habit_id));
        return { tool_use_id: id, content: JSON.stringify({ success: true, message: 'Hábito archivado.' }) };
      }

      case 'delete_habit': {
        await habitsStore.deleteHabit(String(input.habit_id));
        return { tool_use_id: id, content: JSON.stringify({ success: true, message: 'Hábito eliminado.' }) };
      }

      case 'mark_habit_complete': {
        await habitsStore.markComplete(String(input.habit_id), {
          date:  input.date ? String(input.date) : undefined,
          count: input.count ? Number(input.count) : undefined,
          note:  input.note ? String(input.note) : undefined,
        });
        return { tool_use_id: id, content: JSON.stringify({ success: true, message: 'Hábito marcado como completado.' }) };
      }

      case 'get_habit_stats': {
        const today = format(new Date(), 'yyyy-MM-dd');
        const activeHabits = habitsStore.habits.filter(h => !h.archivedAt);
        const todayEntries = habitsStore.entries.filter(e => e.date === today && e.count > 0);
        const completedToday = todayEntries.map(e => e.habitId);

        const stats = activeHabits.map(h => {
          const s = habitsStore.getStatsForHabit(h.id);
          return {
            id:              h.id,
            name:            h.name,
            emoji:           h.emoji,
            category:        h.category,
            type:            h.type,
            completed_today: completedToday.includes(h.id),
            streak:          s?.currentStreak ?? 0,
            longest_streak:  s?.longestStreak ?? 0,
            rate_30d:        s?.completionRate30d ?? 0,
            rate_7d:         s?.completionRate7d ?? 0,
          };
        });

        const summary = {
          total_habits:      activeHabits.length,
          completed_today:   completedToday.length,
          completion_rate_today: activeHabits.length > 0
            ? Math.round((completedToday.length / activeHabits.length) * 100)
            : 0,
          habits: stats,
        };

        return { tool_use_id: id, content: JSON.stringify(summary) };
      }

      case 'get_workout_stats': {
        const now = new Date();
        const cutoff = format(subDays(now, 30), 'yyyy-MM-dd');
        const recent = workoutsStore.workouts.filter(w => w.date >= cutoff);
        const thisWeekCutoff = format(subDays(now, 7), 'yyyy-MM-dd');
        const thisWeek = workoutsStore.workouts.filter(w => w.date >= thisWeekCutoff);
        const totalPRs = workoutsStore.workouts.reduce((s, w) => s + w.prs.length, 0);

        return {
          tool_use_id: id,
          content: JSON.stringify({
            sessions_this_week: thisWeek.length,
            sessions_last_30d:  recent.length,
            total_sessions:     workoutsStore.workouts.length,
            total_prs:          totalPRs,
            avg_volume_30d:     recent.length > 0
              ? Math.round(recent.reduce((s, w) => s + w.totalVolume, 0) / recent.length)
              : 0,
          }),
        };
      }

      case 'get_nutrition_stats': {
        const today = format(new Date(), 'yyyy-MM-dd');
        const todayTotals = nutritionStore.getTotalsForDate(today);
        const last7 = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), 'yyyy-MM-dd'));
        const calReadings = last7.map(d => nutritionStore.getTotalsForDate(d).calories).filter(c => c > 0);
        const avgCalories = calReadings.length > 0
          ? Math.round(calReadings.reduce((a, b) => a + b, 0) / calReadings.length)
          : null;
        const latestWeight = nutritionStore.bodyWeight.length > 0
          ? [...nutritionStore.bodyWeight].sort((a, b) => b.date.localeCompare(a.date))[0]
          : null;

        return {
          tool_use_id: id,
          content: JSON.stringify({
            today: todayTotals,
            target: nutritionStore.targets,
            avg_calories_7d:   avgCalories,
            current_weight_kg: latestWeight?.weight ?? null,
          }),
        };
      }

      default:
        return { tool_use_id: id, content: JSON.stringify({ error: `Tool "${name}" not implemented` }) };
    }
  } catch (err) {
    return {
      tool_use_id: id,
      content: JSON.stringify({ error: err instanceof Error ? err.message : 'Unknown error', success: false }),
    };
  }
}
