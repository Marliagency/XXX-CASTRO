export type BadHabitCategory =
  | 'substance'   // tabaco, alcohol
  | 'digital'     // redes sociales, juegos
  | 'food'        // azúcar, ultraprocesados
  | 'behavior'    // procrastinación, compras compulsivas
  | 'sleep'       // trasnochar, levantarse tarde
  | 'other';

export interface BadHabitMilestone {
  days:    number;
  label:   string;
  emoji:   string;
  reached: boolean;
}

export interface BadHabitRelapse {
  date:     string;
  note?:    string;
  trigger?: string;
}

export interface BadHabit {
  id:          string;
  name:        string;
  emoji:       string;
  category:    BadHabitCategory;
  description?: string;

  // Abstinencia
  startDate:  string;   // ISO — fecha del último reset
  isActive:   boolean;
  isPaused:   boolean;

  // Recaídas
  relapses:   BadHabitRelapse[];

  // Motivación
  reason?:    string;
  savings:    {
    costPerUnit:  number | null;
    unitsPerDay:  number | null;
    currency:     string;
  } | null;

  // Hitos
  milestones: BadHabitMilestone[];

  createdAt:  string;
}

export const DEFAULT_MILESTONES: BadHabitMilestone[] = [
  { days: 1,   label: '24 horas',  emoji: '🌱', reached: false },
  { days: 3,   label: '3 días',    emoji: '💧', reached: false },
  { days: 7,   label: '1 semana',  emoji: '⭐', reached: false },
  { days: 14,  label: '2 semanas', emoji: '🔥', reached: false },
  { days: 21,  label: '21 días',   emoji: '🧠', reached: false },
  { days: 30,  label: '1 mes',     emoji: '🏆', reached: false },
  { days: 60,  label: '2 meses',   emoji: '💪', reached: false },
  { days: 90,  label: '3 meses',   emoji: '🎯', reached: false },
  { days: 180, label: '6 meses',   emoji: '🌟', reached: false },
  { days: 365, label: '1 año',     emoji: '👑', reached: false },
];
