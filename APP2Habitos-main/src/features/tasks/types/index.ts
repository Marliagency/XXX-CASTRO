import { z } from 'zod';

export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskStatusSchema = z.enum(['todo', 'in_progress', 'done', 'archived']);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const TaskSchema = z.object({
  id:          z.string(),
  title:       z.string().min(1),
  description: z.string().optional(),
  status:      TaskStatusSchema.default('todo'),
  priority:    TaskPrioritySchema.default('medium'),
  dueDate:     z.string().optional(),        // 'yyyy-MM-dd'
  completedAt: z.string().optional(),        // ISO timestamp
  createdAt:   z.string(),
  updatedAt:   z.string(),
  tags:        z.array(z.string()).default([]),
  projectId:   z.string().optional(),
  habitId:     z.string().optional(),        // linked habit
  subtasks:    z.array(z.object({
    id:        z.string(),
    title:     z.string(),
    done:      z.boolean(),
  })).default([]),
  isRecurring: z.boolean().default(false),
  recurrence:  z.enum(['daily', 'weekly', 'monthly']).optional(),
});
export type Task = z.infer<typeof TaskSchema>;

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low:    'Baja',
  medium: 'Media',
  high:   'Alta',
  urgent: 'Urgente',
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low:    'var(--text-tertiary)',
  medium: 'var(--warning)',
  high:   'var(--danger)',
  urgent: '#ff0000',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo:       'Por hacer',
  in_progress: 'En progreso',
  done:        'Hecho',
  archived:    'Archivado',
};
