import { create } from 'zustand';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import type { Task, TaskStatus, TaskPriority } from '../types';
import { storage, STORAGE_KEYS } from '../../../shared/lib/storage';

const uid  = () => crypto.randomUUID();
const now  = () => new Date().toISOString();
const today = () => format(new Date(), 'yyyy-MM-dd');

interface TasksState {
  tasks:  Task[];
  loaded: boolean;

  loadFromStorage: () => Promise<void>;

  addTask:    (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Task>;
  updateTask: (id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>;

  // Filters / derived
  getByStatus:    (status: TaskStatus) => Task[];
  getByPriority:  (priority: TaskPriority) => Task[];
  getOverdue:     () => Task[];
  getDueToday:    () => Task[];
  getActiveCount: () => number;
}

export const useTasksStore = create<TasksState>((set, get) => ({
  tasks:  [],
  loaded: false,

  loadFromStorage: async () => {
    const tasks = await storage.getItem<Task[]>(STORAGE_KEYS.tasks);
    set({ tasks: tasks ?? [], loaded: true });
  },

  addTask: async (data) => {
    const task: Task = {
      ...data,
      id:        uid(),
      createdAt: now(),
      updatedAt: now(),
    };
    const tasks = [...get().tasks, task];
    set({ tasks });
    await storage.setItem(STORAGE_KEYS.tasks, tasks);
    return task;
  },

  updateTask: async (id, patch) => {
    const tasks = get().tasks.map(t =>
      t.id === id ? { ...t, ...patch, updatedAt: now() } : t
    );
    set({ tasks });
    await storage.setItem(STORAGE_KEYS.tasks, tasks);
  },

  deleteTask: async (id) => {
    const tasks = get().tasks.filter(t => t.id !== id);
    set({ tasks });
    await storage.setItem(STORAGE_KEYS.tasks, tasks);
  },

  completeTask: async (id) => {
    const task = get().tasks.find(t => t.id === id);
    if (!task) return;

    // If recurring, create next occurrence instead of just marking done
    if (task.isRecurring && task.recurrence && task.dueDate) {
      const nextDue = task.recurrence === 'daily'
        ? format(addDays(new Date(task.dueDate), 1), 'yyyy-MM-dd')
        : task.recurrence === 'weekly'
          ? format(addWeeks(new Date(task.dueDate), 1), 'yyyy-MM-dd')
          : format(addMonths(new Date(task.dueDate), 1), 'yyyy-MM-dd');

      const tasks = get().tasks.map(t =>
        t.id === id
          ? { ...t, status: 'done' as const, completedAt: now(), updatedAt: now() }
          : t
      );
      // Add next recurrence
      const next: Task = {
        ...task,
        id:        uid(),
        dueDate:   nextDue,
        status:    'todo',
        completedAt: undefined,
        subtasks:  task.subtasks.map(s => ({ ...s, done: false })),
        createdAt: now(),
        updatedAt: now(),
      };
      const final = [...tasks, next];
      set({ tasks: final });
      await storage.setItem(STORAGE_KEYS.tasks, final);
    } else {
      await get().updateTask(id, { status: 'done', completedAt: now() });
    }
  },

  toggleSubtask: async (taskId, subtaskId) => {
    const tasks = get().tasks.map(t => {
      if (t.id !== taskId) return t;
      return {
        ...t,
        updatedAt: now(),
        subtasks: t.subtasks.map(s =>
          s.id === subtaskId ? { ...s, done: !s.done } : s
        ),
      };
    });
    set({ tasks });
    await storage.setItem(STORAGE_KEYS.tasks, tasks);
  },

  getByStatus: (status) =>
    get().tasks.filter(t => t.status === status),

  getByPriority: (priority) =>
    get().tasks.filter(t => t.priority === priority && t.status !== 'done' && t.status !== 'archived'),

  getOverdue: () => {
    const t = today();
    return get().tasks.filter(task =>
      task.dueDate && task.dueDate < t && task.status !== 'done' && task.status !== 'archived'
    );
  },

  getDueToday: () => {
    const t = today();
    return get().tasks.filter(task =>
      task.dueDate === t && task.status !== 'done' && task.status !== 'archived'
    );
  },

  getActiveCount: () =>
    get().tasks.filter(t => t.status === 'todo' || t.status === 'in_progress').length,
}));
