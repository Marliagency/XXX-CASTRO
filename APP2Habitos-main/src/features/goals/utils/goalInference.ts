import type { LifeIntent, BodyProfile, TimeBudget, PriorityArea, DerivedTargets, ActivityLevel } from '../types';

// ─── BMR + TDEE ───────────────────────────────────────────────────────────────
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
};

function calcBMR(profile: BodyProfile): number {
  // Mifflin-St Jeor
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  return profile.sex === 'male' ? base + 5 : base - 161;
}

function calcTDEE(profile: BodyProfile): number {
  return Math.round(calcBMR(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel]);
}

// ─── Macro split by intent ────────────────────────────────────────────────────
interface MacroRatios { protein: number; carbs: number; fat: number }

const MACRO_RATIOS: Record<LifeIntent, MacroRatios> = {
  lose_fat:            { protein: 0.35, carbs: 0.35, fat: 0.30 },
  build_muscle:        { protein: 0.30, carbs: 0.45, fat: 0.25 },
  improve_health:      { protein: 0.25, carbs: 0.45, fat: 0.30 },
  boost_productivity:  { protein: 0.25, carbs: 0.50, fat: 0.25 },
  reduce_stress:       { protein: 0.25, carbs: 0.45, fat: 0.30 },
  athletic_performance:{ protein: 0.30, carbs: 0.50, fat: 0.20 },
};

const CALORIE_ADJUSTMENTS: Record<LifeIntent, number> = {
  lose_fat:            -400,
  build_muscle:        +300,
  improve_health:      0,
  boost_productivity:  0,
  reduce_stress:       -100,
  athletic_performance:+200,
};

// ─── Template IDs recommended per intent + days ──────────────────────────────
function recommendTemplates(intent: LifeIntent, daysPerWeek: number): string[] {
  if (intent === 'lose_fat') {
    if (daysPerWeek <= 3) return ['full-body-3x', 'hiit-cardio', 'fat-loss-circuit'];
    return ['ppl-push', 'ppl-pull', 'ppl-legs', 'hiit-cardio', 'fat-loss-circuit'];
  }
  if (intent === 'build_muscle') {
    if (daysPerWeek <= 3) return ['full-body-3x', 'starting-strength'];
    if (daysPerWeek === 4) return ['upper-lower-upper', 'upper-lower-lower', 'phul-power-upper', 'phul-power-lower'];
    return ['ppl-push', 'ppl-pull', 'ppl-legs', 'upper-lower-upper', 'upper-lower-lower'];
  }
  if (intent === 'athletic_performance') {
    return ['531-press', '531-squat', '531-deadlift', 'ppl-legs', 'upper-lower-upper'];
  }
  if (intent === 'reduce_stress') {
    return ['full-body-3x', 'yoga-flow', 'bodyweight-home'];
  }
  // improve_health, boost_productivity
  if (daysPerWeek <= 3) return ['full-body-3x', 'bodyweight-home'];
  return ['upper-lower-upper', 'upper-lower-lower', 'ppl-push', 'ppl-pull'];
}

function recommendWorkoutType(intent: LifeIntent, daysPerWeek: number): string {
  if (intent === 'lose_fat')             return daysPerWeek <= 3 ? 'Full Body + Cardio HIIT' : 'PPL + Cardio';
  if (intent === 'build_muscle')         return daysPerWeek <= 3 ? 'Full Body 3×' : daysPerWeek === 4 ? 'Upper/Lower 4×' : 'PPL 6×';
  if (intent === 'athletic_performance') return '5/3/1 Wendler';
  if (intent === 'reduce_stress')        return 'Full Body Moderado + Yoga';
  return daysPerWeek <= 3 ? 'Full Body 3×' : 'Upper/Lower 4×';
}

// ─── Habit suggestions ────────────────────────────────────────────────────────
const HABIT_SUGGESTIONS: Record<LifeIntent, string[]> = {
  lose_fat: [
    'Pesar alimentos con báscula',
    'Caminar 8.000 pasos diarios',
    'No picar entre comidas',
    'Beber 2.5 L de agua al día',
    'Dormir 7-8 horas',
  ],
  build_muscle: [
    'Consumir proteína en cada comida',
    'Registro de entreno (peso × reps)',
    'Dormir 8 horas para recuperación',
    'Suplemento creatina 5g diarios',
    'Semana de deload cada 4-6 semanas',
  ],
  improve_health: [
    'Caminar 10.000 pasos',
    'Comer 5 porciones de verdura/fruta',
    'Sin azúcar añadida',
    'Meditación 10 min',
    'Estiramientos nocturnos 5 min',
  ],
  boost_productivity: [
    'Bloque de trabajo profundo 2 h',
    'Sin móvil primera hora del día',
    'Revisión semanal de tareas',
    'Lectura 30 min diarios',
    'Técnica Pomodoro (25/5)',
  ],
  reduce_stress: [
    'Meditación guiada 10 min',
    'Diario de gratitud 3 cosas',
    'Sin pantallas 1 h antes de dormir',
    'Paseo al aire libre 20 min',
    'Respiración 4-7-8 antes de dormir',
  ],
  athletic_performance: [
    'Calentamiento específico pre-entreno',
    'Registro de marks personales',
    'Protocolo de recuperación activa',
    'Nutrición periworkout (carbs)',
    'Foam rolling 10 min post-entreno',
  ],
};

// ─── Journal prompts ──────────────────────────────────────────────────────────
const JOURNAL_PROMPTS: Record<LifeIntent, string[]> = {
  lose_fat: [
    '¿Qué comí hoy que no estaba planificado y cómo me afectó?',
    '¿Mi nivel de energía estuvo relacionado con lo que comí?',
    '¿Tuve ansiedad de comer? ¿A qué hora y por qué?',
  ],
  build_muscle: [
    '¿Superé mis marcas de hoy? ¿En qué ejercicio?',
    '¿Cómo fue mi recuperación respecto a la última sesión?',
    '¿Dormí suficiente para rendir en el gimnasio?',
  ],
  improve_health: [
    '¿Qué hice hoy por mi salud que no hago normalmente?',
    '¿Cómo me siento físicamente comparado con la semana pasada?',
    '¿Qué hábito saludable quiero reforzar mañana?',
  ],
  boost_productivity: [
    '¿Cuáles fueron mis 3 tareas más importantes de hoy?',
    '¿Qué me distrajo más y cómo lo evito mañana?',
    '¿Cuánto tiempo trabajé en modo de foco profundo?',
  ],
  reduce_stress: [
    '¿Qué momento de hoy me generó más estrés y por qué?',
    '¿Qué hice para recuperarme emocionalmente?',
    '¿Hay algo que pueda delegar o eliminar de mi lista?',
  ],
  athletic_performance: [
    '¿Cómo fue mi rendimiento hoy comparado con mis objetivos?',
    '¿Qué ajustes de entrenamiento o dieta necesito hacer?',
    '¿Mi motivación está alta o noto señales de sobreentrenamiento?',
  ],
};

// ─── Main inference function ───────────────────────────────────────────────────
export function inferGoalTargets(
  intent: LifeIntent,
  profile: BodyProfile,
  timeBudget: TimeBudget,
  _priorities: PriorityArea[],
): DerivedTargets {
  const tdee = calcTDEE(profile);
  const calorieTarget = Math.max(1200, tdee + CALORIE_ADJUSTMENTS[intent]);

  const ratios = MACRO_RATIOS[intent];
  const proteinG = Math.round((calorieTarget * ratios.protein) / 4);
  const carbsG   = Math.round((calorieTarget * ratios.carbs)   / 4);
  const fatG     = Math.round((calorieTarget * ratios.fat)     / 9);

  const workoutDays = timeBudget.workoutDaysPerWeek;
  const recommendedTemplateIds = recommendTemplates(intent, workoutDays);

  const habitSuggestions = HABIT_SUGGESTIONS[intent];
  const journalPrompts   = JOURNAL_PROMPTS[intent];

  const workoutType = recommendWorkoutType(intent, workoutDays);

  const weeklyGoalSummary = buildSummary(intent, calorieTarget, proteinG, workoutDays, workoutType);

  return {
    calorieTarget,
    proteinG,
    carbsG,
    fatG,
    workoutDaysPerWeek: workoutDays,
    workoutType,
    recommendedTemplateIds,
    habitSuggestions,
    journalPrompts,
    weeklyGoalSummary,
  };
}

function buildSummary(
  intent: LifeIntent,
  kcal: number,
  protein: number,
  days: number,
  workoutType: string,
): string {
  const intentParts: Record<LifeIntent, string> = {
    lose_fat:            `déficit de ${Math.abs(CALORIE_ADJUSTMENTS.lose_fat)} kcal`,
    build_muscle:        `superávit de ${CALORIE_ADJUSTMENTS.build_muscle} kcal`,
    improve_health:      'mantenimiento calórico',
    boost_productivity:  'mantenimiento calórico',
    reduce_stress:       'ligero déficit energético',
    athletic_performance:`superávit controlado de ${CALORIE_ADJUSTMENTS.athletic_performance} kcal`,
  };
  return `${days} días de ${workoutType} · ${kcal} kcal/día (${intentParts[intent]}) · ${protein}g proteína`;
}

// ─── Progress evaluation ──────────────────────────────────────────────────────
export interface GoalProgressInput {
  avgCalories:       number | null;
  avgProtein:        number | null;
  workoutSessionsThisWeek: number;
  habitCompletionPct: number;
  avgMood:           number | null;
}

export interface GoalProgressResult {
  score:       number;   // 0–100
  nutritionOk: boolean;
  workoutOk:   boolean;
  habitsOk:    boolean;
  moodOk:      boolean;
  adjustments: string[];
}

export function evaluateGoalProgress(
  derived: DerivedTargets,
  input: GoalProgressInput,
): GoalProgressResult {
  const adjustments: string[] = [];

  // Nutrition
  const nutritionOk = input.avgCalories !== null
    && Math.abs(input.avgCalories - derived.calorieTarget) < derived.calorieTarget * 0.1;
  if (!nutritionOk && input.avgCalories !== null) {
    const diff = input.avgCalories - derived.calorieTarget;
    adjustments.push(diff > 0
      ? `Reduce ${Math.round(diff)} kcal/día para alcanzar tu objetivo`
      : `Aumenta ${Math.round(-diff)} kcal/día`
    );
  }

  // Protein
  const proteinOk = input.avgProtein !== null && input.avgProtein >= derived.proteinG * 0.9;
  if (!proteinOk && input.avgProtein !== null) {
    adjustments.push(`Necesitas ${Math.round(derived.proteinG - input.avgProtein)}g más de proteína al día`);
  }

  // Workouts
  const workoutOk = input.workoutSessionsThisWeek >= derived.workoutDaysPerWeek;
  if (!workoutOk) {
    adjustments.push(`Completa ${derived.workoutDaysPerWeek - input.workoutSessionsThisWeek} sesión(es) más esta semana`);
  }

  // Habits
  const habitsOk = input.habitCompletionPct >= 70;
  if (!habitsOk) {
    adjustments.push(`Sube el cumplimiento de hábitos al 70% (ahora: ${Math.round(input.habitCompletionPct)}%)`);
  }

  // Mood
  const moodOk = input.avgMood === null || input.avgMood >= 3;
  if (!moodOk) {
    adjustments.push('Tu estado de ánimo medio es bajo — considera reducir la intensidad o priorizar el descanso');
  }

  const points = [nutritionOk && proteinOk, workoutOk, habitsOk, moodOk].filter(Boolean).length;
  const score  = Math.round((points / 4) * 100);

  return { score, nutritionOk: nutritionOk && proteinOk, workoutOk, habitsOk, moodOk, adjustments };
}
