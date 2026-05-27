export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
export type Goal = 'lose_weight' | 'maintain' | 'gain_muscle' | 'improve_fitness' | 'build_habits';
export type Sex = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;

  // Physical data
  birthDate: string | null;       // ISO date 'YYYY-MM-DD'
  sex: Sex | null;
  heightCm: number | null;
  weightKg: number | null;
  targetWeightKg: number | null;

  // Lifestyle
  activityLevel: ActivityLevel | null;
  goal: Goal | null;

  // App preferences
  enabledFeatures: {
    habits: boolean;
    workouts: boolean;
    nutrition: boolean;
    journal: boolean;
    tasks: boolean;
  };

  createdAt: string;
  onboardingCompleted: boolean;
  onboardingStep: number;
}

export type ActivityLevelConfig = {
  value: ActivityLevel;
  label: string;
  description: string;
  multiplier: number;
};

export const ACTIVITY_LEVELS: ActivityLevelConfig[] = [
  { value: 'sedentary',   label: 'Sedentario',      description: 'Poco o nada de ejercicio',               multiplier: 1.2   },
  { value: 'light',       label: 'Ligeramente activo', description: '1-3 días/semana de ejercicio suave',   multiplier: 1.375 },
  { value: 'moderate',    label: 'Moderadamente activo', description: '3-5 días/semana de ejercicio moderado', multiplier: 1.55 },
  { value: 'active',      label: 'Activo',           description: '6-7 días/semana de ejercicio intenso',   multiplier: 1.725 },
  { value: 'very_active', label: 'Muy activo',       description: 'Ejercicio muy intenso diario o doble sesión', multiplier: 1.9 },
];

export const GOALS: { value: Goal; label: string; emoji: string; description: string }[] = [
  { value: 'lose_weight',     label: 'Perder peso',     emoji: '🔥', description: 'Reducir grasa corporal de forma sostenible' },
  { value: 'maintain',        label: 'Mantener peso',   emoji: '⚖️', description: 'Mantener mi peso y composición actuales' },
  { value: 'gain_muscle',     label: 'Ganar músculo',   emoji: '💪', description: 'Aumentar masa muscular y fuerza' },
  { value: 'improve_fitness', label: 'Mejorar forma',   emoji: '🏃', description: 'Mejorar mi rendimiento cardiovascular' },
  { value: 'build_habits',    label: 'Crear hábitos',   emoji: '✅', description: 'Construir rutinas saludables diarias' },
];
