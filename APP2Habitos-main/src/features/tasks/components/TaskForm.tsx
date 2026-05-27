import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, X } from 'lucide-react';
import { Button, Input, Textarea } from '../../../shared/components/ui';
import { PRIORITY_LABELS } from '../types';
import type { Task, TaskPriority } from '../types';

const uid = () => crypto.randomUUID();
const today = () => format(new Date(), 'yyyy-MM-dd');

interface TaskFormProps {
  initial?: Task | null;
  onSave:   (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  saving?:  boolean;
}

export function TaskForm({ initial, onSave, onCancel, saving = false }: TaskFormProps) {
  const [title,       setTitle]       = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [priority,    setPriority]    = useState<TaskPriority>(initial?.priority ?? 'medium');
  const [dueDate,     setDueDate]     = useState(initial?.dueDate ?? '');
  const [tags,        setTags]        = useState<string[]>(initial?.tags ?? []);
  const [tagInput,    setTagInput]    = useState('');
  const [subtasks,    setSubtasks]    = useState(initial?.subtasks ?? []);
  const [subtaskInput, setSubtaskInput] = useState('');
  const [isRecurring,  setIsRecurring]  = useState(initial?.isRecurring ?? false);
  const [recurrence,   setRecurrence]   = useState<Task['recurrence']>(initial?.recurrence);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput('');
  };

  const addSubtask = () => {
    const t = subtaskInput.trim();
    if (t) setSubtasks(prev => [...prev, { id: uid(), title: t, done: false }]);
    setSubtaskInput('');
  };

  const handleSubmit = () => {
    if (!title.trim()) return;
    onSave({
      title:       title.trim(),
      description: description.trim() || undefined,
      priority,
      status:      initial?.status ?? 'todo',
      dueDate:     dueDate || undefined,
      tags,
      subtasks,
      isRecurring,
      recurrence:  isRecurring ? recurrence : undefined,
      completedAt: initial?.completedAt,
      projectId:   initial?.projectId,
      habitId:     initial?.habitId,
    });
  };

  const PRIORITIES: TaskPriority[] = ['low', 'medium', 'high', 'urgent'];

  return (
    <div className="space-y-4">
      {/* Title */}
      <Input
        placeholder="¿Qué necesitas hacer?"
        value={title}
        onChange={e => setTitle(e.target.value)}
        autoFocus
      />

      {/* Description */}
      <Textarea
        placeholder="Descripción (opcional)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        rows={3}
      />

      {/* Priority */}
      <div>
        <label className="text-xs text-[var(--text-tertiary)] mb-2 block">Prioridad</label>
        <div className="flex gap-2">
          {PRIORITIES.map(p => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`flex-1 py-1.5 rounded-[var(--r-md)] text-xs font-medium transition-all ${
                priority === p
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {PRIORITY_LABELS[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Due date */}
      <div>
        <label className="text-xs text-[var(--text-tertiary)] mb-1 block">Fecha límite</label>
        <Input
          type="date"
          value={dueDate}
          onChange={e => setDueDate(e.target.value)}
          min={today()}
        />
      </div>

      {/* Recurring */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsRecurring(r => !r)}
          className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-[var(--r-md)] border transition-all ${
            isRecurring
              ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
              : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          Recurrente
        </button>
        {isRecurring && (
          <div className="flex gap-1.5">
            {(['daily', 'weekly', 'monthly'] as const).map(r => (
              <button
                key={r}
                onClick={() => setRecurrence(r)}
                className={`text-xs px-2.5 py-1 rounded-[var(--r-md)] transition-all ${
                  recurrence === r
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {r === 'daily' ? 'Diaria' : r === 'weekly' ? 'Semanal' : 'Mensual'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Subtasks */}
      <div>
        <label className="text-xs text-[var(--text-tertiary)] mb-2 block">Subtareas</label>
        <div className="space-y-1.5 mb-2">
          {subtasks.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="w-4 text-[var(--text-tertiary)]">{i + 1}.</span>
              <span className="flex-1">{s.title}</span>
              <button
                onClick={() => setSubtasks(prev => prev.filter(x => x.id !== s.id))}
                aria-label="Eliminar subtarea"
                className="text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Añadir subtarea…"
            value={subtaskInput}
            onChange={e => setSubtaskInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addSubtask()}
            className="flex-1"
          />
          <Button variant="ghost" size="sm" onClick={addSubtask} aria-label="Añadir subtarea">
            <Plus size={14} />
          </Button>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs text-[var(--text-tertiary)] mb-2 block">Etiquetas</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
              {tag}
              <button onClick={() => setTags(prev => prev.filter(t => t !== tag))} aria-label={`Eliminar etiqueta ${tag}`}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Nueva etiqueta…"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
            className="flex-1"
          />
          <Button variant="ghost" size="sm" onClick={addTag} aria-label="Añadir etiqueta">
            <Plus size={14} />
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="ghost" onClick={onCancel} className="flex-1">Cancelar</Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!title.trim() || saving}
          loading={saving}
          className="flex-1"
        >
          {initial ? 'Actualizar' : 'Crear tarea'}
        </Button>
      </div>
    </div>
  );
}
