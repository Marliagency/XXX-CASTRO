import { z } from 'zod';

export const HabitFrequencySchema = z.object({
  type: z.enum(['daily', 'weekly', 'times_per_week']),
  days: z.array(z.number().min(0).max(6)),
  timesPerWeek: z.number().nullable(),
});

export const HabitScheduleSchema = z.object({
  enabled: z.boolean(),
  time: z.string().nullable(),
  duration: z.number().nullable(),
  flexibility: z.enum(['strict', 'window']),
  windowEnd: z.string().nullable(),
  reminders: z.object({
    enabled: z.boolean(),
    minutesBefore: z.number(),
  }),
});

export const HabitEntrySchema = z.object({
  id: z.string(),
  habitId: z.string(),
  date: z.string(),
  completedAt: z.string(),
  count: z.number(),
  note: z.string().optional(),
  skipped: z.boolean(),
  skipReason: z.string().optional(),
});

export const HabitSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(60),
  emoji: z.string(),
  description: z.string().optional(),
  color: z.string(),
  category: z.enum(['mind', 'body', 'focus', 'knowledge', 'nutrition', 'social', 'other']),
  frequency: HabitFrequencySchema,
  schedule: HabitScheduleSchema.nullable(),
  type: z.enum(['boolean', 'count']),
  targetCount: z.number().nullable(),
  unit: z.string().nullable(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  identity: z.string().optional(),
  cue: z.string().optional(),
  reward: z.string().optional(),
  linkedHabitId: z.string().nullable(),
  createdAt: z.string(),
  archivedAt: z.string().nullable(),
  order: z.number(),
});

export type Habit = z.infer<typeof HabitSchema>;
export type HabitEntry = z.infer<typeof HabitEntrySchema>;
export type HabitFrequency = z.infer<typeof HabitFrequencySchema>;
export type HabitSchedule = z.infer<typeof HabitScheduleSchema>;
export type HabitCategory = Habit['category'];
export type HabitDifficulty = Habit['difficulty'];

export interface HabitStats {
  habitId: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  completionRate30d: number;
  completionRate7d: number;
  lastCompletedDate: string | null;
}
