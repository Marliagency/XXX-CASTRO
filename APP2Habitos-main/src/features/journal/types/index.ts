import { z } from 'zod';

export const MoodSchema = z.number().int().min(1).max(5);
export type Mood = z.infer<typeof MoodSchema>;

export const JournalTagSchema = z.enum([
  'gratitud', 'reto', 'logro', 'aprendizaje', 'reflexion',
  'relaciones', 'salud', 'trabajo', 'metas', 'otro',
]);
export type JournalTag = z.infer<typeof JournalTagSchema>;

export const JournalEntrySchema = z.object({
  id:        z.string(),
  date:      z.string(),          // 'yyyy-MM-dd'
  createdAt: z.string(),          // ISO
  updatedAt: z.string(),
  title:     z.string().optional(),
  content:   z.string(),
  mood:      MoodSchema.nullable(),
  energy:    z.number().int().min(1).max(5).nullable(),
  tags:      z.array(JournalTagSchema),
  // AI-generated follow-up prompts & answers
  aiPrompts: z.array(z.object({
    question: z.string(),
    answer:   z.string().optional(),
  })).optional(),
  // Weather / location snapshot (optional metadata)
  weather:   z.string().nullable().optional(),
  isPinned:  z.boolean().default(false),
  wordCount: z.number(),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;

export const MOOD_LABELS: Record<number, string> = {
  1: 'Muy mal',
  2: 'Mal',
  3: 'Regular',
  4: 'Bien',
  5: 'Excelente',
};

export const MOOD_EMOJI: Record<number, string> = {
  1: '😞',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😄',
};

export const MOOD_COLOR: Record<number, string> = {
  1: 'var(--danger)',
  2: 'var(--warning)',
  3: 'var(--text-tertiary)',
  4: 'var(--success)',
  5: 'var(--accent)',
};

export const TAG_LABELS: Record<JournalTag, string> = {
  gratitud:    'Gratitud',
  reto:        'Reto',
  logro:       'Logro',
  aprendizaje: 'Aprendizaje',
  reflexion:   'Reflexión',
  relaciones:  'Relaciones',
  salud:       'Salud',
  trabajo:     'Trabajo',
  metas:       'Metas',
  otro:        'Otro',
};

// AI prompts by mood and intent
export const AI_PROMPTS_BY_MOOD: Record<number, string[]> = {
  1: [
    '¿Qué es lo más difícil de hoy?',
    '¿Hay algo que puedas cambiar mañana para sentirte mejor?',
    '¿Qué necesitas en este momento?',
    '¿A quién podrías pedir ayuda o apoyo?',
  ],
  2: [
    '¿Qué ha salido mal hoy y qué puedes aprender de ello?',
    '¿Hay algo que hayas evitado afrontar?',
    '¿Qué pequeña victoria has tenido hoy aunque sea mínima?',
  ],
  3: [
    '¿Qué ha sido lo más interesante de hoy?',
    '¿En qué momento te has sentido más en flujo?',
    '¿Qué decisión tomarías diferente?',
  ],
  4: [
    '¿Qué ha contribuido a que hoy sea un buen día?',
    '¿Qué has aprendido de ti mismo hoy?',
    '¿Cómo puedes replicar este estado mañana?',
  ],
  5: [
    '¿Qué te ha hecho sentir tan bien hoy?',
    '¿Cómo puedes mantener este momentum?',
    '¿Con quién quieres compartir esta energía?',
    '¿Qué agradeces profundamente en este momento?',
  ],
};

export const DAILY_PROMPTS = [
  '¿Cuáles son tus 3 prioridades de hoy?',
  '¿Qué estás evitando hacer y por qué?',
  '¿Qué te haría sentir que hoy fue un éxito?',
  '¿Qué te dio energía esta semana?',
  '¿Qué te drenó energía?',
  '¿En qué momento de hoy te has sentido más tú mismo?',
  '¿Qué hábito quieres reforzar esta semana?',
  '¿Qué pensamiento recurrente necesitas soltar?',
  '¿Qué conversación importante has estado posponiendo?',
  '¿Qué pequeño paso puedes dar hoy hacia tu objetivo principal?',
];
