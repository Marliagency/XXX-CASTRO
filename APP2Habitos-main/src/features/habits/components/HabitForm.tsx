import { useState } from 'react';
import { Button, Input, Toggle } from '../../../shared/components/ui';
import type { Habit } from '../types';

const EMOJI_OPTIONS = [
  '🧘','💪','📚','💧','✍️','🎯','🚶','😴','🥩','🏃',
  '🤸','🙏','💬','☕','🎓','📝','✅','🔍','🚿','🍳',
  '🎧','🧹','📵','🎵','🌿','❤️','🌙','⚡','🦋','🌟',
];

const COLORS = [
  '#0066ff','#7c3aed','#10b981','#f59e0b','#ef4444',
  '#18181b','#ec4899','#0ea5e9','#6366f1','#92400e',
];

const CATEGORIES: { value: Habit['category']; label: string }[] = [
  { value: 'mind',      label: 'Mente' },
  { value: 'body',      label: 'Cuerpo' },
  { value: 'focus',     label: 'Enfoque' },
  { value: 'knowledge', label: 'Conocimiento' },
  { value: 'nutrition', label: 'Nutrición' },
  { value: 'social',    label: 'Social' },
  { value: 'other',     label: 'Otro' },
];

const DAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

interface FormState {
  name: string;
  emoji: string;
  description: string;
  color: string;
  category: Habit['category'];
  frequencyType: Habit['frequency']['type'];
  frequencyDays: number[];
  timesPerWeek: string;
  type: Habit['type'];
  targetCount: string;
  unit: string;
  difficulty: Habit['difficulty'];
  identity: string;
  scheduleEnabled: boolean;
  scheduleTime: string;
  scheduleDuration: string;
}

interface HabitFormProps {
  initialData?: Partial<Habit>;
  onSubmit: (data: Omit<Habit, 'id' | 'createdAt' | 'order'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function HabitForm({ initialData, onSubmit, onCancel, loading }: HabitFormProps) {
  const [form, setForm] = useState<FormState>({
    name:            initialData?.name ?? '',
    emoji:           initialData?.emoji ?? '⭐',
    description:     initialData?.description ?? '',
    color:           initialData?.color ?? '#0066ff',
    category:        initialData?.category ?? 'other',
    frequencyType:   initialData?.frequency?.type ?? 'daily',
    frequencyDays:   initialData?.frequency?.days ?? [],
    timesPerWeek:    String(initialData?.frequency?.timesPerWeek ?? 3),
    type:            initialData?.type ?? 'boolean',
    targetCount:     String(initialData?.targetCount ?? 1),
    unit:            initialData?.unit ?? '',
    difficulty:      initialData?.difficulty ?? 'medium',
    identity:        initialData?.identity ?? '',
    scheduleEnabled: initialData?.schedule?.enabled ?? false,
    scheduleTime:    initialData?.schedule?.time ?? '08:00',
    scheduleDuration: String(initialData?.schedule?.duration ?? 15),
  });

  const [nameError, setNameError] = useState('');

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const toggleDay = (day: number) =>
    update('frequencyDays', form.frequencyDays.includes(day)
      ? form.frequencyDays.filter(d => d !== day)
      : [...form.frequencyDays, day]);

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setNameError('El nombre es obligatorio');
      return;
    }
    setNameError('');

    const data: Omit<Habit, 'id' | 'createdAt' | 'order'> = {
      name:        form.name.trim(),
      emoji:       form.emoji,
      description: form.description.trim() || undefined,
      color:       form.color,
      category:    form.category,
      frequency: {
        type:         form.frequencyType,
        days:         form.frequencyDays,
        timesPerWeek: form.frequencyType === 'times_per_week' ? Number(form.timesPerWeek) : null,
      },
      schedule: form.scheduleEnabled ? {
        enabled:     true,
        time:        form.scheduleTime,
        duration:    form.scheduleDuration ? Number(form.scheduleDuration) : null,
        flexibility: 'window',
        windowEnd:   null,
        reminders:   { enabled: false, minutesBefore: 10 },
      } : null,
      type:        form.type,
      targetCount: form.type === 'count' ? Number(form.targetCount) : null,
      unit:        form.type === 'count' && form.unit.trim() ? form.unit.trim() : null,
      difficulty:  form.difficulty,
      identity:    form.identity.trim() || undefined,
      cue:         undefined,
      reward:      undefined,
      linkedHabitId: null,
      archivedAt:  null,
    };

    onSubmit(data);
  };

  return (
    <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
      {/* Emoji picker */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Emoji</label>
        <div className="flex flex-wrap gap-1">
          {EMOJI_OPTIONS.map(e => (
            <button
              key={e}
              type="button"
              onClick={() => update('emoji', e)}
              className={`w-9 h-9 rounded-[var(--r-sm)] text-lg flex items-center justify-center transition-colors ${
                form.emoji === e ? 'bg-[var(--bg-selected)] ring-2 ring-[var(--accent)]' : 'hover:bg-[var(--bg-hover)]'
              }`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <Input
        label="Nombre"
        value={form.name}
        onChange={e => update('name', e.target.value)}
        placeholder="Ej. Meditar 10 minutos"
        error={nameError}
        autoFocus
      />

      {/* Description */}
      <Input
        label="Descripción (opcional)"
        value={form.description}
        onChange={e => update('description', e.target.value)}
        placeholder="Breve descripción..."
      />

      {/* Color */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => update('color', c)}
              className={`w-7 h-7 rounded-full transition-transform ${
                form.color === c ? 'scale-125 ring-2 ring-offset-2 ring-[var(--neutral-900)]' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Category + Difficulty */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Categoría</label>
          <select
            value={form.category}
            onChange={e => update('category', e.target.value as Habit['category'])}
            className="w-full h-9 px-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
          >
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Dificultad</label>
          <select
            value={form.difficulty}
            onChange={e => update('difficulty', e.target.value as Habit['difficulty'])}
            className="w-full h-9 px-2 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
          >
            <option value="easy">Fácil</option>
            <option value="medium">Medio</option>
            <option value="hard">Difícil</option>
          </select>
        </div>
      </div>

      {/* Frequency */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Frecuencia</label>
        <div className="flex gap-1.5">
          {(['daily', 'weekly', 'times_per_week'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => update('frequencyType', t)}
              className={`flex-1 py-1.5 text-xs rounded-[var(--r-md)] border transition-colors ${
                form.frequencyType === t
                  ? 'bg-[var(--neutral-900)] text-white border-transparent'
                  : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {t === 'daily' ? 'Diario' : t === 'weekly' ? 'Días espec.' : 'X/semana'}
            </button>
          ))}
        </div>

        {form.frequencyType === 'weekly' && (
          <div className="flex gap-1">
            {DAY_LABELS.map((d, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={`flex-1 py-1 text-xs rounded-[var(--r-sm)] border transition-colors ${
                  form.frequencyDays.includes(i)
                    ? 'bg-[var(--accent)] text-white border-transparent'
                    : 'border-[var(--border-default)] text-[var(--text-secondary)]'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {form.frequencyType === 'times_per_week' && (
          <Input
            type="number"
            value={form.timesPerWeek}
            onChange={e => update('timesPerWeek', e.target.value)}
            placeholder="3"
            hint="Veces por semana"
          />
        )}
      </div>

      {/* Type */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-[var(--text-secondary)]">Tipo de seguimiento</label>
        <div className="flex gap-1.5">
          {(['boolean', 'count'] as const).map(t => (
            <button
              key={t}
              type="button"
              onClick={() => update('type', t)}
              className={`flex-1 py-1.5 text-xs rounded-[var(--r-md)] border transition-colors ${
                form.type === t
                  ? 'bg-[var(--neutral-900)] text-white border-transparent'
                  : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {t === 'boolean' ? 'Sí / No' : 'Contador'}
            </button>
          ))}
        </div>
        {form.type === 'count' && (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              value={form.targetCount}
              onChange={e => update('targetCount', e.target.value)}
              label="Objetivo"
              placeholder="8"
            />
            <Input
              value={form.unit}
              onChange={e => update('unit', e.target.value)}
              label="Unidad"
              placeholder="vasos, pasos..."
            />
          </div>
        )}
      </div>

      {/* Schedule */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Horario programado</label>
          <Toggle checked={form.scheduleEnabled} onChange={v => update('scheduleEnabled', v)} />
        </div>
        {form.scheduleEnabled && (
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="time"
              value={form.scheduleTime}
              onChange={e => update('scheduleTime', e.target.value)}
              label="Hora"
            />
            <Input
              type="number"
              value={form.scheduleDuration}
              onChange={e => update('scheduleDuration', e.target.value)}
              label="Duración (min)"
              placeholder="15"
            />
          </div>
        )}
      </div>

      {/* Identity */}
      <Input
        value={form.identity}
        onChange={e => update('identity', e.target.value)}
        label="Identidad (opcional)"
        placeholder='"Soy alguien que..."'
        hint="Atomic Habits: ancla el hábito a tu identidad"
      />

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
        <Button variant="ghost" size="md" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button variant="primary" size="md" onClick={handleSubmit} loading={loading} className="flex-1">
          {initialData?.id ? 'Guardar cambios' : 'Crear hábito'}
        </Button>
      </div>
    </div>
  );
}
