import { z } from 'zod';

export const MuscleGroupSchema = z.enum([
  'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
  'quads', 'hamstrings', 'glutes', 'calves', 'core', 'full_body', 'cardio',
]);

export const ExerciseSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(['compound', 'isolation', 'cardio', 'mobility', 'core']),
  muscleGroups: z.array(MuscleGroupSchema),
  equipment: z.enum(['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'band', 'other']),
  instructions: z.string().optional(),
  videoUrl: z.string().nullable(),
  isCustom: z.boolean(),
});

export const SetSchema = z.object({
  id: z.string(),
  type: z.enum(['warmup', 'working', 'dropset', 'failure', 'amrap', 'myo_rep']),
  weight: z.number().nullable(),
  reps: z.number().nullable(),
  duration: z.number().nullable(),
  distance: z.number().nullable(),
  rpe: z.number().min(1).max(10).nullable(),
  rir: z.number().min(0).max(10).nullable().optional(),   // Reps In Reserve
  tempo: z.string().nullable().optional(),                // e.g. "3-1-2-0"
  completed: z.boolean(),
  isPR: z.boolean().optional(),
  notes: z.string().optional(),
});

export const WorkoutExerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  sets: z.array(SetSchema),
  restSeconds: z.number().nullable(),
  notes: z.string().optional(),
  supersetWithId: z.string().nullable(),
});

export const PRSchema = z.object({
  exerciseId: z.string(),
  type: z.enum(['1RM', 'volume', 'reps']),
  value: z.number(),
});

export const WorkoutSchema = z.object({
  id: z.string(),
  name: z.string(),
  date: z.string(),
  startedAt: z.string(),
  finishedAt: z.string().nullable(),
  durationMinutes: z.number().nullable(),
  exercises: z.array(WorkoutExerciseSchema),
  templateId: z.string().nullable(),
  bodyWeight: z.number().nullable(),
  energy: z.number().min(1).max(5).nullable(),
  notes: z.string().optional(),
  totalVolume: z.number(),
  prs: z.array(PRSchema),
});

export const WorkoutTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  category: z.enum(['strength', 'hypertrophy', 'endurance', 'powerlifting', 'fullbody', 'upper_lower', 'ppl', 'other']),
  exercises: z.array(z.object({
    exerciseId: z.string(),
    sets: z.number(),
    reps: z.string(),
    restSeconds: z.number(),
    notes: z.string().optional(),
  })),
  estimatedMinutes: z.number(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  isCustom: z.boolean(),
});

export type Exercise = z.infer<typeof ExerciseSchema>;
export type ExerciseSet = z.infer<typeof SetSchema>;
export type WorkoutExercise = z.infer<typeof WorkoutExerciseSchema>;
export type Workout = z.infer<typeof WorkoutSchema>;
export type WorkoutTemplate = z.infer<typeof WorkoutTemplateSchema>;
export type MuscleGroup = z.infer<typeof MuscleGroupSchema>;
export type PR = z.infer<typeof PRSchema>;

// 1RM formulas
export function calc1RMEpley(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30));
}
export function calc1RMBrzycki(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * (36 / (37 - reps)));
}
export function calc1RMLombardi(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return Math.round(weight * Math.pow(reps, 0.1));
}
export function calc1RM(weight: number, reps: number): number {
  // Averaged across 3 formulas for better accuracy
  return Math.round((calc1RMEpley(weight, reps) + calc1RMBrzycki(weight, reps) + calc1RMLombardi(weight, reps)) / 3);
}

/** Wilks score for relative strength comparison */
export function calcWilks(bodyweightKg: number, liftedKg: number, sex: 'male' | 'female'): number {
  const mCoeffs = [-216.0475144, 16.2606339, -0.002388645, -0.00113732, 7.01863e-6, -1.291e-8];
  const fCoeffs = [594.31747775582, -27.23842536447, 0.82112226871, -0.00930733913, 4.731582e-5, -9.054e-8];
  const c = sex === 'male' ? mCoeffs : fCoeffs;
  const bw = bodyweightKg;
  const denom = c[0] + c[1]*bw + c[2]*bw**2 + c[3]*bw**3 + c[4]*bw**4 + c[5]*bw**5;
  return Math.round((500 / denom) * liftedKg * 10) / 10;
}

// Workout goals types
export const WorkoutGoalSchema = z.object({
  type: z.enum(['strength', 'hypertrophy', 'endurance', 'powerlifting', 'weight_loss']),
  exerciseId: z.string().optional(),
  targetWeight: z.number().optional(),
  targetReps: z.number().optional(),
  targetDate: z.string().optional(),
});
export type WorkoutGoal = z.infer<typeof WorkoutGoalSchema>;

export function calcTotalVolume(exercises: WorkoutExercise[]): number {
  return exercises.reduce((total, ex) => {
    return total + ex.sets
      .filter(s => s.completed && s.weight != null && s.reps != null)
      .reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);
  }, 0);
}

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest:       'Pecho',
  back:        'Espalda',
  shoulders:   'Hombros',
  biceps:      'Bíceps',
  triceps:     'Tríceps',
  forearms:    'Antebrazos',
  quads:       'Cuádriceps',
  hamstrings:  'Isquiotibiales',
  glutes:      'Glúteos',
  calves:      'Pantorrillas',
  core:        'Core',
  full_body:   'Cuerpo completo',
  cardio:      'Cardio',
};

// Weekly plan types
export interface DayPlan {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  templateId: string | null;
}

export interface WeeklyPlan {
  id: string;
  name: string;
  days: DayPlan[];
  createdAt: string;
}

export const EQUIPMENT_LABELS: Record<Exercise['equipment'], string> = {
  barbell:    'Barra',
  dumbbell:   'Mancuernas',
  machine:    'Máquina',
  cable:      'Cable',
  bodyweight: 'Peso corporal',
  kettlebell: 'Kettlebell',
  band:       'Banda elástica',
  other:      'Otro',
};
