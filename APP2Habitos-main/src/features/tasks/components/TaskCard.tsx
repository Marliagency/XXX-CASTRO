import { format, parseISO, isToday, isPast } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Circle, Clock, Trash2, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { PRIORITY_COLORS, PRIORITY_LABELS } from '../types';
import type { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onComplete: (id: string) => void;
  onSelect:   (task: Task) => void;
  onDelete:   (id: string) => void;
}

export function TaskCard({ task, onComplete, onSelect, onDelete }: TaskCardProps) {
  const isDone     = task.status === 'done';
  const isOverdue  = task.dueDate && isPast(parseISO(task.dueDate)) && !isDone;
  const dueIsToday = task.dueDate && isToday(parseISO(task.dueDate));

  const completedSubtasks = task.subtasks.filter(s => s.done).length;
  const totalSubtasks     = task.subtasks.length;

  return (
    <div
      className={clsx(
        'group flex items-start gap-3 px-4 py-3 rounded-[var(--r-xl)] border transition-all',
        isDone
          ? 'border-[var(--border-subtle)] opacity-60'
          : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-default)]',
      )}
    >
      {/* Complete button */}
      <button
        onClick={() => onComplete(task.id)}
        aria-label={isDone ? 'Marcar como pendiente' : 'Completar tarea'}
        className="mt-0.5 shrink-0 text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
      >
        {isDone
          ? <CheckCircle2 size={18} className="text-[var(--success)]" />
          : <Circle size={18} />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelect(task)}>
        <p className={clsx(
          'text-sm font-medium text-[var(--text-primary)] truncate',
          isDone && 'line-through text-[var(--text-tertiary)]',
        )}>
          {task.title}
        </p>

        {task.description && (
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">{task.description}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {/* Priority dot */}
          <span
            className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border"
            style={{ color: PRIORITY_COLORS[task.priority], borderColor: PRIORITY_COLORS[task.priority] + '40' }}
          >
            {PRIORITY_LABELS[task.priority]}
          </span>

          {/* Due date */}
          {task.dueDate && (
            <div className={clsx(
              'flex items-center gap-1 text-[10px]',
              isOverdue ? 'text-[var(--danger)]' : dueIsToday ? 'text-[var(--warning)]' : 'text-[var(--text-tertiary)]',
            )}>
              <Clock size={9} />
              <span>{format(parseISO(task.dueDate), 'd MMM', { locale: es })}</span>
            </div>
          )}

          {/* Subtasks progress */}
          {totalSubtasks > 0 && (
            <span className="text-[10px] text-[var(--text-tertiary)]">
              {completedSubtasks}/{totalSubtasks}
            </span>
          )}

          {/* Tags */}
          {task.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--bg-base)] text-[var(--text-tertiary)] border border-[var(--border-subtle)]">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onDelete(task.id)}
          aria-label="Eliminar tarea"
          className="opacity-0 group-hover:opacity-100 w-6 h-6 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] transition-all"
        >
          <Trash2 size={12} className="text-[var(--danger)]" />
        </button>
        <ChevronRight size={14} className="text-[var(--text-tertiary)] cursor-pointer" onClick={() => onSelect(task)} />
      </div>
    </div>
  );
}
