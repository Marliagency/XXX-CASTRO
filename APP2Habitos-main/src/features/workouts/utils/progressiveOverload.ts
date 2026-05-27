import type { Workout, ExerciseSet } from '../types';

export interface OverloadRecommendation {
  exerciseId: string;
  exerciseName: string;
  lastWeight: number;
  lastReps: number;
  suggestedWeight: number;
  suggestedReps: number;
  repsAchieved: boolean;   // did user hit top of rep range last time?
  confidence: 'high' | 'medium' | 'low';
  note: string;
}

interface SetHistory {
  weight: number;
  reps: number;
  date: string;
}


export function computeRecommendations(
  workouts: Workout[],
  exerciseNameMap: Map<string, { name: string } | string>,
  targetRepRange: [number, number] = [8, 12],
): OverloadRecommendation[] {
  const exerciseHistory = new Map<string, SetHistory[]>();

  // Collect history per exercise, sorted oldest-first
  for (const workout of [...workouts].sort((a, b) => a.date.localeCompare(b.date))) {
    for (const ex of workout.exercises) {
      const completed = ex.sets.filter((s: ExerciseSet) => s.completed && s.weight != null && s.reps != null);
      if (completed.length === 0) continue;
      const history = exerciseHistory.get(ex.exerciseId) ?? [];
      history.push(...completed.map((s: ExerciseSet) => ({
        weight: s.weight!,
        reps:   s.reps!,
        date:   workout.date,
      })));
      exerciseHistory.set(ex.exerciseId, history);
    }
  }

  const recs: OverloadRecommendation[] = [];

  for (const [exerciseId, history] of exerciseHistory) {
    if (history.length < 2) continue;

    const recent = history.slice(-6);
    const last = recent[recent.length - 1];
    const [minReps, maxReps] = targetRepRange;

    const repsAchieved = last.reps >= maxReps;
    let suggestedWeight = last.weight;
    let suggestedReps   = last.reps;
    let note            = '';
    let confidence: OverloadRecommendation['confidence'] = 'medium';

    if (repsAchieved) {
      // Double progression: increase weight by ~2.5kg, reset reps to bottom
      const increment = last.weight < 60 ? 2.5 : last.weight < 100 ? 2.5 : 5;
      suggestedWeight = last.weight + increment;
      suggestedReps   = minReps;
      note = `Reps objetivo alcanzadas. Sube ${increment}kg y vuelve a ${minReps} reps.`;
      confidence = 'high';
    } else if (last.reps < minReps) {
      // Too heavy — suggest maintaining or dropping slightly
      suggestedWeight = last.weight;
      suggestedReps   = last.reps + 1;
      note = `Añade 1 rep manteniendo el peso.`;
      confidence = 'high';
    } else {
      // Within range — add a rep
      suggestedReps = Math.min(last.reps + 1, maxReps);
      note = `Intenta una rep más esta sesión.`;
      confidence = 'medium';
    }

    // Check for stall (same weight/reps across last 3 sessions)
    if (recent.length >= 3) {
      const last3 = recent.slice(-3);
      const stalled = last3.every(s => s.weight === last.weight && s.reps === last.reps);
      if (stalled) {
        note += ' (estancamiento detectado — considera descanso o deload)';
        confidence = 'low';
      }
    }

    recs.push({
      exerciseId,
      exerciseName: (() => { const v = exerciseNameMap.get(exerciseId); return v ? (typeof v === 'string' ? v : v.name) : exerciseId; })(),
      lastWeight:    last.weight,
      lastReps:      last.reps,
      suggestedWeight,
      suggestedReps,
      repsAchieved,
      confidence,
      note,
    });
  }

  return recs.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.confidence] - order[b.confidence];
  });
}

/** Simple fatigue score: higher = more fatigued, may need deload */
export function computeFatigueScore(workouts: Workout[], days = 14): number {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const recent = workouts.filter(w => new Date(w.date) >= cutoff);

  const sessionsPerWeek = (recent.length / days) * 7;
  const avgVolume = recent.reduce((s, w) => s + w.totalVolume, 0) / Math.max(1, recent.length);

  // Score 0-100. >3 sessions/week + high volume = fatigue
  const freqScore   = Math.min(50, (sessionsPerWeek / 5) * 50);
  const volumeScore = Math.min(50, (avgVolume / 10000) * 50);
  return Math.round(freqScore + volumeScore);
}
