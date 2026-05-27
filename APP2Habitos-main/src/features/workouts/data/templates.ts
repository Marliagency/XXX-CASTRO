import type { WorkoutTemplate } from '../types';

export const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  // ── 1. Push Pull Legs — Día Push ──────────────────────────────────────────
  {
    id: 'ppl-push',
    name: 'PPL — Push (Empuje)',
    description: 'Pecho, hombros y tríceps. Ideal para ganar masa.',
    category: 'ppl',
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    isCustom: false,
    exercises: [
      { exerciseId: 'bench-press',      sets: 4, reps: '6-8',  restSeconds: 150 },
      { exerciseId: 'db-incline',       sets: 3, reps: '10-12',restSeconds: 120 },
      { exerciseId: 'ohp',              sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'lateral-raise',    sets: 3, reps: '15-20',restSeconds: 60  },
      { exerciseId: 'tricep-pushdown',  sets: 3, reps: '12-15',restSeconds: 60  },
      { exerciseId: 'overhead-ext',     sets: 3, reps: '12-15',restSeconds: 60  },
    ],
  },

  // ── 2. Push Pull Legs — Día Pull ──────────────────────────────────────────
  {
    id: 'ppl-pull',
    name: 'PPL — Pull (Tracción)',
    description: 'Espalda y bíceps. Énfasis en ancho y grosor.',
    category: 'ppl',
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    isCustom: false,
    exercises: [
      { exerciseId: 'deadlift',         sets: 3, reps: '5',    restSeconds: 180 },
      { exerciseId: 'pullup',           sets: 3, reps: 'max',  restSeconds: 120 },
      { exerciseId: 'bent-row',         sets: 4, reps: '6-8',  restSeconds: 150 },
      { exerciseId: 'lat-pulldown',     sets: 3, reps: '10-12',restSeconds: 90  },
      { exerciseId: 'face-pull',        sets: 3, reps: '15-20',restSeconds: 60  },
      { exerciseId: 'barbell-curl',     sets: 3, reps: '10-12',restSeconds: 60  },
      { exerciseId: 'hammer-curl',      sets: 3, reps: '12-15',restSeconds: 60  },
    ],
  },

  // ── 3. Push Pull Legs — Día Legs ──────────────────────────────────────────
  {
    id: 'ppl-legs',
    name: 'PPL — Legs (Piernas)',
    description: 'Piernas completas con énfasis en cuádriceps y glúteos.',
    category: 'ppl',
    difficulty: 'intermediate',
    estimatedMinutes: 65,
    isCustom: false,
    exercises: [
      { exerciseId: 'squat',            sets: 4, reps: '6-8',  restSeconds: 180 },
      { exerciseId: 'leg-press',        sets: 3, reps: '10-12',restSeconds: 120 },
      { exerciseId: 'rdl',              sets: 3, reps: '10-12',restSeconds: 120 },
      { exerciseId: 'leg-extension',    sets: 3, reps: '15',   restSeconds: 60  },
      { exerciseId: 'leg-curl',         sets: 3, reps: '12-15',restSeconds: 60  },
      { exerciseId: 'standing-calf',    sets: 4, reps: '15-20',restSeconds: 60  },
    ],
  },

  // ── 4. Upper Body ─────────────────────────────────────────────────────────
  {
    id: 'upper-lower-upper',
    name: 'Upper/Lower — Upper',
    description: 'Parte superior completa: pecho, espalda, hombros y brazos.',
    category: 'upper_lower',
    difficulty: 'intermediate',
    estimatedMinutes: 70,
    isCustom: false,
    exercises: [
      { exerciseId: 'bench-press',      sets: 4, reps: '6-8',  restSeconds: 120 },
      { exerciseId: 'bent-row',         sets: 4, reps: '6-8',  restSeconds: 120 },
      { exerciseId: 'db-shoulder-press',sets: 3, reps: '10-12',restSeconds: 90  },
      { exerciseId: 'lat-pulldown',     sets: 3, reps: '10-12',restSeconds: 90  },
      { exerciseId: 'db-fly',           sets: 3, reps: '12-15',restSeconds: 60  },
      { exerciseId: 'barbell-curl',     sets: 2, reps: '12',   restSeconds: 60  },
      { exerciseId: 'tricep-pushdown',  sets: 2, reps: '12',   restSeconds: 60  },
    ],
  },

  // ── 5. Lower Body ─────────────────────────────────────────────────────────
  {
    id: 'upper-lower-lower',
    name: 'Upper/Lower — Lower',
    description: 'Parte inferior: cuádriceps, isquiotibiales, glúteos y pantorrillas.',
    category: 'upper_lower',
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    isCustom: false,
    exercises: [
      { exerciseId: 'squat',            sets: 4, reps: '5',    restSeconds: 180 },
      { exerciseId: 'rdl',              sets: 3, reps: '8-10', restSeconds: 120 },
      { exerciseId: 'leg-press',        sets: 3, reps: '12',   restSeconds: 90  },
      { exerciseId: 'hip-thrust',       sets: 3, reps: '12',   restSeconds: 90  },
      { exerciseId: 'leg-curl',         sets: 3, reps: '12',   restSeconds: 60  },
      { exerciseId: 'standing-calf',    sets: 4, reps: '20',   restSeconds: 45  },
    ],
  },

  // ── 6. Starting Strength (Beginner) ───────────────────────────────────────
  {
    id: 'starting-strength',
    name: 'Starting Strength',
    description: '3x5 en los básicos. El programa más efectivo para principiantes.',
    category: 'strength',
    difficulty: 'beginner',
    estimatedMinutes: 45,
    isCustom: false,
    exercises: [
      { exerciseId: 'squat',            sets: 3, reps: '5',    restSeconds: 180, notes: 'Añade 2.5kg cada sesión' },
      { exerciseId: 'bench-press',      sets: 3, reps: '5',    restSeconds: 180, notes: 'Alterna con press militar' },
      { exerciseId: 'deadlift',         sets: 1, reps: '5',    restSeconds: 240, notes: 'Añade 5kg cada sesión' },
    ],
  },

  // ── 7. 5/3/1 Wendler (Día Press) ──────────────────────────────────────────
  {
    id: '531-press',
    name: '5/3/1 — Día Press Militar',
    description: 'Protocolo Wendler. Progresión ondulante de 4 semanas.',
    category: 'strength',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    isCustom: false,
    exercises: [
      { exerciseId: 'ohp',              sets: 3, reps: '5/3/1',restSeconds: 180, notes: '65%/75%/85% del 1RM estimado. Último set AMRAP' },
      { exerciseId: 'bench-press',      sets: 5, reps: '10',   restSeconds: 90,  notes: 'Trabajo asistencia (50% del 1RM)' },
      { exerciseId: 'db-row',           sets: 5, reps: '10',   restSeconds: 60  },
      { exerciseId: 'lateral-raise',    sets: 3, reps: '15',   restSeconds: 60  },
      { exerciseId: 'tricep-pushdown',  sets: 3, reps: '15',   restSeconds: 60  },
    ],
  },

  // ── 8. Full Body 3x ───────────────────────────────────────────────────────
  {
    id: 'full-body-3x',
    name: 'Full Body 3×/semana',
    description: 'Cuerpo completo con patrones fundamentales. Ideal para maximizar frecuencia.',
    category: 'fullbody',
    difficulty: 'beginner',
    estimatedMinutes: 50,
    isCustom: false,
    exercises: [
      { exerciseId: 'squat',            sets: 3, reps: '8',    restSeconds: 120 },
      { exerciseId: 'bench-press',      sets: 3, reps: '8',    restSeconds: 120 },
      { exerciseId: 'bent-row',         sets: 3, reps: '8',    restSeconds: 120 },
      { exerciseId: 'ohp',              sets: 3, reps: '8',    restSeconds: 90  },
      { exerciseId: 'rdl',              sets: 3, reps: '10',   restSeconds: 90  },
      { exerciseId: 'plank',            sets: 3, reps: '30s',  restSeconds: 45  },
    ],
  },

  // ── 9. StrongLifts 5×5 ───────────────────────────────────────────────────
  {
    id: 'stronglifts-a',
    name: 'StrongLifts 5×5 — Día A',
    description: 'Sentadilla, press de banca y remo. Progresión lineal 2.5kg por sesión.',
    category: 'strength',
    difficulty: 'beginner',
    estimatedMinutes: 40,
    isCustom: false,
    exercises: [
      { exerciseId: 'squat',      sets: 5, reps: '5', restSeconds: 180, notes: 'Añade 2.5kg cada sesión' },
      { exerciseId: 'bench-press',sets: 5, reps: '5', restSeconds: 180, notes: 'Añade 2.5kg cada sesión' },
      { exerciseId: 'bent-row',   sets: 5, reps: '5', restSeconds: 180, notes: 'Añade 2.5kg cada sesión' },
    ],
  },

  // ── 10. StrongLifts 5×5 Día B ────────────────────────────────────────────
  {
    id: 'stronglifts-b',
    name: 'StrongLifts 5×5 — Día B',
    description: 'Sentadilla, press militar y peso muerto. Alterna con Día A.',
    category: 'strength',
    difficulty: 'beginner',
    estimatedMinutes: 40,
    isCustom: false,
    exercises: [
      { exerciseId: 'squat',    sets: 5, reps: '5', restSeconds: 180, notes: 'Añade 2.5kg cada sesión' },
      { exerciseId: 'ohp',      sets: 5, reps: '5', restSeconds: 180, notes: 'Añade 2.5kg cada sesión' },
      { exerciseId: 'deadlift', sets: 1, reps: '5', restSeconds: 240, notes: 'Añade 5kg cada sesión' },
    ],
  },

  // ── 11. PHUL — Power Upper ───────────────────────────────────────────────
  {
    id: 'phul-power-upper',
    name: 'PHUL — Power Upper',
    description: 'Fuerza en pecho, espalda y hombros. 4 días de programa híbrido.',
    category: 'upper_lower',
    difficulty: 'intermediate',
    estimatedMinutes: 65,
    isCustom: false,
    exercises: [
      { exerciseId: 'bench-press', sets: 3, reps: '3-5',  restSeconds: 210 },
      { exerciseId: 'incline-bench',sets: 3, reps: '6-10', restSeconds: 150 },
      { exerciseId: 'bent-row',    sets: 3, reps: '3-5',  restSeconds: 210 },
      { exerciseId: 'lat-pulldown',sets: 3, reps: '6-10', restSeconds: 120 },
      { exerciseId: 'ohp',         sets: 2, reps: '5-8',  restSeconds: 150 },
      { exerciseId: 'barbell-curl',sets: 2, reps: '6-10', restSeconds: 90  },
      { exerciseId: 'skull-crusher',sets: 2, reps: '6-10',restSeconds: 90  },
    ],
  },

  // ── 12. PHUL — Power Lower ───────────────────────────────────────────────
  {
    id: 'phul-power-lower',
    name: 'PHUL — Power Lower',
    description: 'Fuerza en piernas y glúteos. Parte del programa PHUL de 4 días.',
    category: 'upper_lower',
    difficulty: 'intermediate',
    estimatedMinutes: 60,
    isCustom: false,
    exercises: [
      { exerciseId: 'squat',     sets: 3, reps: '3-5',  restSeconds: 240 },
      { exerciseId: 'deadlift',  sets: 3, reps: '3-5',  restSeconds: 240 },
      { exerciseId: 'leg-press', sets: 3, reps: '6-10', restSeconds: 120 },
      { exerciseId: 'leg-curl',  sets: 3, reps: '6-10', restSeconds: 90  },
      { exerciseId: 'standing-calf', sets: 3, reps: '6-10', restSeconds: 60 },
    ],
  },

  // ── 13. 5/3/1 — Día Sentadilla ───────────────────────────────────────────
  {
    id: '531-squat',
    name: '5/3/1 — Día Sentadilla',
    description: 'Protocolo Wendler. Sentadilla principal + asistencia de piernas.',
    category: 'strength',
    difficulty: 'advanced',
    estimatedMinutes: 65,
    isCustom: false,
    exercises: [
      { exerciseId: 'squat',        sets: 3, reps: '5/3/1',restSeconds: 240, notes: '65%/75%/85% del 1RM. Último set AMRAP' },
      { exerciseId: 'leg-press',    sets: 5, reps: '10',   restSeconds: 90,  notes: '50% del 1RM aprox.' },
      { exerciseId: 'leg-curl',     sets: 5, reps: '10',   restSeconds: 60  },
      { exerciseId: 'standing-calf',sets: 5, reps: '10',   restSeconds: 45  },
      { exerciseId: 'ab-wheel',     sets: 5, reps: '10',   restSeconds: 45  },
    ],
  },

  // ── 14. 5/3/1 — Día Peso Muerto ──────────────────────────────────────────
  {
    id: '531-deadlift',
    name: '5/3/1 — Día Peso Muerto',
    description: 'Protocolo Wendler. Peso muerto principal + asistencia de espalda.',
    category: 'strength',
    difficulty: 'advanced',
    estimatedMinutes: 60,
    isCustom: false,
    exercises: [
      { exerciseId: 'deadlift',      sets: 3, reps: '5/3/1',restSeconds: 300, notes: '65%/75%/85% del 1RM. Último set AMRAP' },
      { exerciseId: 'rdl',           sets: 5, reps: '10',   restSeconds: 90  },
      { exerciseId: 'hyperextension',sets: 5, reps: '10',   restSeconds: 60  },
      { exerciseId: 'pullup',        sets: 5, reps: 'max',  restSeconds: 90  },
      { exerciseId: 'face-pull',     sets: 5, reps: '20',   restSeconds: 45  },
    ],
  },

  // ── 15. Bodyweight Home ───────────────────────────────────────────────────
  {
    id: 'bodyweight-home',
    name: 'Calistenia en casa',
    description: 'Entrenamiento completo sin equipamiento. Ideal para entrenar en casa.',
    category: 'fullbody',
    difficulty: 'beginner',
    estimatedMinutes: 35,
    isCustom: false,
    exercises: [
      { exerciseId: 'pushup',       sets: 4, reps: '10-20', restSeconds: 60  },
      { exerciseId: 'pullup',       sets: 3, reps: 'max',   restSeconds: 90  },
      { exerciseId: 'lunge',        sets: 3, reps: '12',    restSeconds: 60  },
      { exerciseId: 'dip',          sets: 3, reps: '10-15', restSeconds: 60  },
      { exerciseId: 'bulgarian-squat',sets: 3, reps: '10', restSeconds: 90  },
      { exerciseId: 'plank',        sets: 3, reps: '45s',   restSeconds: 45  },
    ],
  },

  // ── 16. HIIT Cardio + Fuerza (Fat Loss) ──────────────────────────────────
  {
    id: 'hiit-cardio',
    name: 'HIIT — Cardio + Fuerza',
    description: 'Circuito de alta intensidad para quema de grasa. Máx. 45 min.',
    category: 'fullbody',
    difficulty: 'intermediate',
    estimatedMinutes: 45,
    isCustom: false,
    exercises: [
      { exerciseId: 'goblet-squat', sets: 4, reps: '15',   restSeconds: 30  },
      { exerciseId: 'pushup',       sets: 4, reps: '15',   restSeconds: 30  },
      { exerciseId: 'db-row',       sets: 4, reps: '15',   restSeconds: 30  },
      { exerciseId: 'lunge',        sets: 4, reps: '12',   restSeconds: 30  },
      { exerciseId: 'db-shoulder-press',sets: 4, reps: '12',restSeconds: 30 },
      { exerciseId: 'plank',        sets: 4, reps: '30s',  restSeconds: 30  },
    ],
  },

  // ── 17. Circuito Pérdida de Grasa ────────────────────────────────────────
  {
    id: 'fat-loss-circuit',
    name: 'Circuito Pérdida de Grasa',
    description: 'Superseries y poco descanso para mantener músculo en déficit.',
    category: 'fullbody',
    difficulty: 'intermediate',
    estimatedMinutes: 50,
    isCustom: false,
    exercises: [
      { exerciseId: 'squat',        sets: 4, reps: '12',   restSeconds: 45  },
      { exerciseId: 'bench-press',  sets: 4, reps: '12',   restSeconds: 45  },
      { exerciseId: 'bent-row',     sets: 4, reps: '12',   restSeconds: 45  },
      { exerciseId: 'rdl',          sets: 3, reps: '12',   restSeconds: 45  },
      { exerciseId: 'db-shoulder-press',sets: 3, reps: '12',restSeconds: 45 },
      { exerciseId: 'face-pull',    sets: 3, reps: '20',   restSeconds: 30  },
    ],
  },
];
