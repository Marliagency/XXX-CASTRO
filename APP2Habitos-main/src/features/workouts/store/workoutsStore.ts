import { create } from 'zustand';
import { format } from 'date-fns';
import type { Exercise, Workout, WorkoutExercise, ExerciseSet, WorkoutTemplate, WeeklyPlan, DayPlan } from '../types';
import { calc1RM, calcTotalVolume } from '../types';
import { storage, STORAGE_KEYS } from '../../../shared/lib/storage';
import { EXERCISES } from '../data/exercises';
import { WORKOUT_TEMPLATES } from '../data/templates';

const uid = () => crypto.randomUUID();

function defaultSet(): ExerciseSet {
  return { id: uid(), type: 'working', weight: null, reps: null, duration: null, distance: null, rpe: null, completed: false };
}

interface WorkoutsState {
  exercises: Exercise[];
  workouts: Workout[];
  templates: WorkoutTemplate[];
  weeklyPlan: Record<number, string | null>; // legacy simple plan
  weeklyPlans: WeeklyPlan[];
  activePlanId: string | null;
  activeWorkout: Workout | null;
  loaded: boolean;

  loadFromStorage: () => Promise<void>;

  // Exercises
  addCustomExercise: (data: Omit<Exercise, 'id' | 'isCustom' | 'videoUrl'>) => Promise<Exercise>;

  // Active workout
  startWorkout: (name: string, templateId?: string) => void;
  addExerciseToActive: (exerciseId: string) => void;
  removeExerciseFromActive: (workoutExerciseId: string) => void;
  addSetToExercise: (workoutExerciseId: string, type?: ExerciseSet['type']) => void;
  updateSet: (workoutExerciseId: string, setId: string, patch: Partial<ExerciseSet>) => void;
  removeSet: (workoutExerciseId: string, setId: string) => void;
  finishWorkout: () => Promise<Workout | null>;
  discardWorkout: () => void;

  // History
  getWorkoutsForExercise: (exerciseId: string) => Workout[];
  getLastSetForExercise: (exerciseId: string) => { weight: number | null; reps: number | null } | null;
  getPRForExercise: (exerciseId: string) => { orm: number; weight: number; reps: number } | null;
  getVolumeByWeek: () => { week: string; volume: number }[];
  getWorkoutsByMonth: () => { date: string; count: number }[];

  // Legacy simple plan
  setDayPlan: (day: number, templateId: string | null) => Promise<void>;

  // Named weekly plans
  createWeeklyPlan: (data: { name: string; days: DayPlan[] }) => Promise<WeeklyPlan>;
  updateDayPlan: (planId: string, dayOfWeek: number, patch: Partial<DayPlan>) => Promise<void>;
  setActivePlan: (planId: string | null) => Promise<void>;
  deleteWeeklyPlan: (planId: string) => Promise<void>;

  // User templates
  saveAsTemplate: (workout: Workout) => Promise<WorkoutTemplate>;
  deleteUserTemplate: (id: string) => Promise<void>;

  // Repeat a past workout
  repeatWorkout: (workout: Workout) => void;
}

export const useWorkoutsStore = create<WorkoutsState>((set, get) => ({
  exercises: EXERCISES,
  workouts: [],
  templates: WORKOUT_TEMPLATES,
  weeklyPlan: {},
  weeklyPlans: [],
  activePlanId: null,
  activeWorkout: null,
  loaded: false,

  loadFromStorage: async () => {
    const [workouts, customExercises, userTemplates, weeklyPlan, weeklyPlans, activePlanId] = await Promise.all([
      storage.getItem<Workout[]>(STORAGE_KEYS.workouts),
      storage.getItem<Exercise[]>(STORAGE_KEYS.exercises),
      storage.getItem<WorkoutTemplate[]>(STORAGE_KEYS.workoutTemplates),
      storage.getItem<Record<number, string | null>>(STORAGE_KEYS.workoutPlan),
      storage.getItem<WeeklyPlan[]>(STORAGE_KEYS.weeklyPlans),
      storage.getItem<string>(STORAGE_KEYS.activeWeeklyPlanId),
    ]);
    set({
      workouts:    workouts ?? [],
      exercises:   [...EXERCISES, ...(customExercises ?? [])],
      templates:   [...(userTemplates ?? []), ...WORKOUT_TEMPLATES],
      weeklyPlan:  weeklyPlan ?? {},
      weeklyPlans: weeklyPlans ?? [],
      activePlanId: activePlanId ?? null,
      loaded:      true,
    });
  },

  addCustomExercise: async (data) => {
    const exercise: Exercise = { ...data, id: uid(), isCustom: true, videoUrl: null };
    const custom = get().exercises.filter(e => e.isCustom);
    await storage.setItem(STORAGE_KEYS.exercises, [...custom, exercise]);
    set(s => ({ exercises: [...s.exercises, exercise] }));
    return exercise;
  },

  startWorkout: (name, templateId) => {
    const template = templateId ? get().templates.find(t => t.id === templateId) : null;
    const exercises: WorkoutExercise[] = template
      ? template.exercises.map(te => ({
          id: uid(),
          exerciseId: te.exerciseId,
          restSeconds: te.restSeconds,
          supersetWithId: null,
          sets: Array.from({ length: te.sets }, () => defaultSet()),
          notes: te.notes,
        }))
      : [];

    const workout: Workout = {
      id: uid(),
      name,
      date: format(new Date(), 'yyyy-MM-dd'),
      startedAt: new Date().toISOString(),
      finishedAt: null,
      durationMinutes: null,
      exercises,
      templateId: templateId ?? null,
      bodyWeight: null,
      energy: null,
      totalVolume: 0,
      prs: [],
    };
    set({ activeWorkout: workout });
  },

  addExerciseToActive: (exerciseId) => {
    set(s => {
      if (!s.activeWorkout) return s;
      const newEx: WorkoutExercise = {
        id: uid(),
        exerciseId,
        sets: [defaultSet()],
        restSeconds: 90,
        supersetWithId: null,
      };
      return {
        activeWorkout: {
          ...s.activeWorkout,
          exercises: [...s.activeWorkout.exercises, newEx],
        },
      };
    });
  },

  removeExerciseFromActive: (workoutExerciseId) => {
    set(s => {
      if (!s.activeWorkout) return s;
      return {
        activeWorkout: {
          ...s.activeWorkout,
          exercises: s.activeWorkout.exercises.filter(e => e.id !== workoutExerciseId),
        },
      };
    });
  },

  addSetToExercise: (workoutExerciseId, type = 'working') => {
    set(s => {
      if (!s.activeWorkout) return s;
      return {
        activeWorkout: {
          ...s.activeWorkout,
          exercises: s.activeWorkout.exercises.map(ex => {
            if (ex.id !== workoutExerciseId) return ex;
            const last = ex.sets[ex.sets.length - 1];
            return {
              ...ex,
              sets: [...ex.sets, {
                ...defaultSet(),
                type,
                weight: last?.weight ?? null,
                reps: last?.reps ?? null,
              }],
            };
          }),
        },
      };
    });
  },

  updateSet: (workoutExerciseId, setId, patch) => {
    set(s => {
      if (!s.activeWorkout) return s;
      return {
        activeWorkout: {
          ...s.activeWorkout,
          exercises: s.activeWorkout.exercises.map(ex => {
            if (ex.id !== workoutExerciseId) return ex;
            return { ...ex, sets: ex.sets.map(st => st.id === setId ? { ...st, ...patch } : st) };
          }),
        },
      };
    });
  },

  removeSet: (workoutExerciseId, setId) => {
    set(s => {
      if (!s.activeWorkout) return s;
      return {
        activeWorkout: {
          ...s.activeWorkout,
          exercises: s.activeWorkout.exercises.map(ex => {
            if (ex.id !== workoutExerciseId) return ex;
            return { ...ex, sets: ex.sets.filter(st => st.id !== setId) };
          }),
        },
      };
    });
  },

  finishWorkout: async () => {
    const aw = get().activeWorkout;
    if (!aw) return null;

    const finishedAt = new Date().toISOString();
    const startMs = new Date(aw.startedAt).getTime();
    const durationMinutes = Math.round((Date.now() - startMs) / 60000);
    const totalVolume = calcTotalVolume(aw.exercises);

    // Detect PRs
    const prs = detectPRs(aw.exercises, get().workouts);

    const finished: Workout = { ...aw, finishedAt, durationMinutes, totalVolume, prs };
    const updated = [...get().workouts, finished];
    await storage.setItem(STORAGE_KEYS.workouts, updated);
    set({ workouts: updated, activeWorkout: null });
    return finished;
  },

  discardWorkout: () => set({ activeWorkout: null }),

  getWorkoutsForExercise: (exerciseId) =>
    get().workouts.filter(w => w.exercises.some(e => e.exerciseId === exerciseId)),

  getLastSetForExercise: (exerciseId) => {
    const workouts = get().getWorkoutsForExercise(exerciseId);
    if (!workouts.length) return null;
    const last = workouts[workouts.length - 1];
    const ex = last.exercises.find(e => e.exerciseId === exerciseId);
    const lastDoneSet = ex?.sets.filter(s => s.completed).pop();
    return lastDoneSet ? { weight: lastDoneSet.weight, reps: lastDoneSet.reps } : null;
  },

  getPRForExercise: (exerciseId) => {
    const workouts = get().getWorkoutsForExercise(exerciseId);
    let bestOrm = 0;
    let bestW = 0;
    let bestR = 0;
    for (const w of workouts) {
      const ex = w.exercises.find(e => e.exerciseId === exerciseId);
      if (!ex) continue;
      for (const s of ex.sets) {
        if (!s.completed || !s.weight || !s.reps) continue;
        const orm = calc1RM(s.weight, s.reps);
        if (orm > bestOrm) { bestOrm = orm; bestW = s.weight; bestR = s.reps; }
      }
    }
    return bestOrm > 0 ? { orm: bestOrm, weight: bestW, reps: bestR } : null;
  },

  getVolumeByWeek: () => {
    const map = new Map<string, number>();
    for (const w of get().workouts) {
      const week = format(new Date(w.date), 'yyyy-ww');
      map.set(week, (map.get(week) ?? 0) + w.totalVolume);
    }
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-12)
      .map(([week, volume]) => ({ week, volume }));
  },

  getWorkoutsByMonth: () => {
    const map = new Map<string, number>();
    for (const w of get().workouts) {
      map.set(w.date, (map.get(w.date) ?? 0) + 1);
    }
    return [...map.entries()].map(([date, count]) => ({ date, count }));
  },

  setDayPlan: async (day, templateId) => {
    const plan = { ...get().weeklyPlan, [day]: templateId };
    set({ weeklyPlan: plan });
    await storage.setItem(STORAGE_KEYS.workoutPlan, plan);
  },

  createWeeklyPlan: async ({ name, days }) => {
    const plan: WeeklyPlan = { id: uid(), name, days, createdAt: new Date().toISOString() };
    const updated = [...get().weeklyPlans, plan];
    set({ weeklyPlans: updated });
    await storage.setItem(STORAGE_KEYS.weeklyPlans, updated);
    return plan;
  },

  updateDayPlan: async (planId, dayOfWeek, patch) => {
    const updated = get().weeklyPlans.map(p => {
      if (p.id !== planId) return p;
      const days = p.days.map(d => d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d);
      const hasDay = p.days.some(d => d.dayOfWeek === dayOfWeek);
      return { ...p, days: hasDay ? days : [...p.days, { dayOfWeek, templateId: null, ...patch } as DayPlan] };
    });
    set({ weeklyPlans: updated });
    await storage.setItem(STORAGE_KEYS.weeklyPlans, updated);
  },

  setActivePlan: async (planId) => {
    set({ activePlanId: planId });
    await storage.setItem(STORAGE_KEYS.activeWeeklyPlanId, planId);
  },

  deleteWeeklyPlan: async (planId) => {
    const updated = get().weeklyPlans.filter(p => p.id !== planId);
    const activePlanId = get().activePlanId === planId ? null : get().activePlanId;
    set({ weeklyPlans: updated, activePlanId });
    await Promise.all([
      storage.setItem(STORAGE_KEYS.weeklyPlans, updated),
      storage.setItem(STORAGE_KEYS.activeWeeklyPlanId, activePlanId),
    ]);
  },

  saveAsTemplate: async (workout) => {
    const template: WorkoutTemplate = {
      id: uid(),
      name: workout.name,
      description: `Guardado el ${format(new Date(), 'd/M/yyyy')}`,
      category: 'other',
      exercises: workout.exercises
        .filter(ex => ex.sets.some(s => s.completed))
        .map(ex => {
          const doneSets = ex.sets.filter(s => s.completed);
          const repValues = doneSets.map(s => s.reps ?? 8).filter(Boolean);
          return {
            exerciseId:   ex.exerciseId,
            sets:         doneSets.length || 3,
            reps:         repValues.length > 0 ? `${Math.min(...repValues)}-${Math.max(...repValues)}` : '8-12',
            restSeconds:  ex.restSeconds ?? 90,
            notes:        ex.notes || undefined,
          };
        }),
      estimatedMinutes: workout.durationMinutes ?? 60,
      difficulty: 'intermediate',
      isCustom: true,
    };

    const existing = get().templates.filter(t => t.isCustom);
    const updated  = [template, ...existing];
    await storage.setItem(STORAGE_KEYS.workoutTemplates, updated);
    set(s => ({ templates: [template, ...s.templates] }));
    return template;
  },

  deleteUserTemplate: async (id) => {
    const remaining = get().templates.filter(t => t.isCustom && t.id !== id);
    await storage.setItem(STORAGE_KEYS.workoutTemplates, remaining);
    set(s => ({ templates: s.templates.filter(t => t.id !== id) }));
  },

  repeatWorkout: (workout) => {
    const exercises: WorkoutExercise[] = workout.exercises.map(ex => ({
      id:             uid(),
      exerciseId:     ex.exerciseId,
      restSeconds:    ex.restSeconds,
      supersetWithId: null,
      notes:          ex.notes,
      sets: ex.sets
        .filter(s => s.completed)
        .map(s => ({
          ...defaultSet(),
          weight: s.weight,
          reps:   s.reps,
          type:   s.type,
        }))
        .concat(ex.sets.filter(s => s.completed).length === 0 ? [defaultSet()] : []),
    }));
    const newWorkout: Workout = {
      id:              uid(),
      name:            workout.name,
      date:            format(new Date(), 'yyyy-MM-dd'),
      startedAt:       new Date().toISOString(),
      finishedAt:      null,
      durationMinutes: null,
      exercises,
      templateId:      null,
      bodyWeight:      null,
      energy:          null,
      totalVolume:     0,
      prs:             [],
    };
    set({ activeWorkout: newWorkout });
  },
}));

function detectPRs(exercises: WorkoutExercise[], history: Workout[]): Workout['prs'] {
  const prs: Workout['prs'] = [];
  for (const ex of exercises) {
    const histWorkouts = history.filter(w => w.exercises.some(e => e.exerciseId === ex.exerciseId));
    let bestOrm = 0;
    for (const w of histWorkouts) {
      const he = w.exercises.find(e => e.exerciseId === ex.exerciseId);
      if (!he) continue;
      for (const s of he.sets) {
        if (s.completed && s.weight && s.reps) {
          bestOrm = Math.max(bestOrm, calc1RM(s.weight, s.reps));
        }
      }
    }
    for (const s of ex.sets) {
      if (s.completed && s.weight && s.reps) {
        const orm = calc1RM(s.weight, s.reps);
        if (orm > bestOrm) {
          bestOrm = orm;
          prs.push({ exerciseId: ex.exerciseId, type: '1RM', value: orm });
        }
      }
    }
  }
  return prs;
}
