import { create } from 'zustand';
import { format } from 'date-fns';
import type { Habit, HabitEntry, HabitStats } from '../types';
import { storage, STORAGE_KEYS } from '../../../shared/lib/storage';
import { calculateHabitStats } from '../utils/streaks';

const uid = () => crypto.randomUUID();
const todayStr = () => format(new Date(), 'yyyy-MM-dd');

interface HabitsState {
  habits: Habit[];
  entries: HabitEntry[];
  loaded: boolean;

  loadFromStorage: () => Promise<void>;
  addHabit: (data: Omit<Habit, 'id' | 'createdAt' | 'order'>) => Promise<Habit>;
  updateHabit: (id: string, patch: Partial<Omit<Habit, 'id' | 'createdAt'>>) => Promise<void>;
  archiveHabit: (id: string) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  reorderHabits: (orderedIds: string[]) => Promise<void>;

  markComplete: (habitId: string, opts?: { date?: string; note?: string; count?: number }) => Promise<void>;
  decrementCount: (habitId: string, date?: string) => Promise<void>;
  markSkipped: (habitId: string, date: string, reason?: string) => Promise<void>;
  unmark: (habitId: string, date: string) => Promise<void>;

  getEntriesForHabit: (habitId: string) => HabitEntry[];
  getEntryForDate: (habitId: string, date: string) => HabitEntry | null;
  getStatsForHabit: (habitId: string) => HabitStats | null;
  getHabitsScheduledToday: () => Habit[];
  getActiveHabits: () => Habit[];
}

async function saveHabits(habits: Habit[]) {
  await storage.setItem(STORAGE_KEYS.habits, habits);
}

async function saveEntries(entries: HabitEntry[]) {
  await storage.setItem(STORAGE_KEYS.habitEntries, entries);
}

export const useHabitsStore = create<HabitsState>((set, get) => ({
  habits: [],
  entries: [],
  loaded: false,

  loadFromStorage: async () => {
    const [habits, entries] = await Promise.all([
      storage.getItem<Habit[]>(STORAGE_KEYS.habits),
      storage.getItem<HabitEntry[]>(STORAGE_KEYS.habitEntries),
    ]);
    set({ habits: habits ?? [], entries: entries ?? [], loaded: true });
  },

  addHabit: async (data) => {
    const habit: Habit = {
      ...data,
      id: uid(),
      createdAt: new Date().toISOString(),
      order: get().habits.length,
    };
    const updated = [...get().habits, habit];
    await saveHabits(updated);
    set({ habits: updated });
    return habit;
  },

  updateHabit: async (id, patch) => {
    const updated = get().habits.map(h => h.id === id ? { ...h, ...patch } : h);
    await saveHabits(updated);
    set({ habits: updated });
  },

  archiveHabit: async (id) => {
    await get().updateHabit(id, { archivedAt: new Date().toISOString() });
  },

  deleteHabit: async (id) => {
    const habits = get().habits.filter(h => h.id !== id);
    const entries = get().entries.filter(e => e.habitId !== id);
    await Promise.all([saveHabits(habits), saveEntries(entries)]);
    set({ habits, entries });
  },

  reorderHabits: async (orderedIds) => {
    const updated = get().habits.map(h => ({ ...h, order: orderedIds.indexOf(h.id) }));
    await saveHabits(updated);
    set({ habits: updated });
  },

  markComplete: async (habitId, opts = {}) => {
    const { date = todayStr(), note, count = 1 } = opts;
    const entries = get().entries;
    const existing = entries.find(e => e.habitId === habitId && e.date === date);
    let updated: HabitEntry[];

    if (existing) {
      updated = entries.map(e =>
        e.id === existing.id
          ? { ...e, count: e.count + count, skipped: false, completedAt: new Date().toISOString(), note }
          : e
      );
    } else {
      const entry: HabitEntry = {
        id: uid(),
        habitId,
        date,
        count,
        completedAt: new Date().toISOString(),
        skipped: false,
        note,
      };
      updated = [...entries, entry];
    }

    await saveEntries(updated);
    set({ entries: updated });
  },

  decrementCount: async (habitId, date) => {
    const d = date ?? todayStr();
    const entries = get().entries;
    const existing = entries.find(e => e.habitId === habitId && e.date === d);
    if (!existing || existing.count <= 0) return;

    const newCount = existing.count - 1;
    const updated = newCount === 0
      ? entries.filter(e => e.id !== existing.id)
      : entries.map(e => e.id === existing.id ? { ...e, count: newCount } : e);

    await saveEntries(updated);
    set({ entries: updated });
  },

  markSkipped: async (habitId, date, reason) => {
    const entries = get().entries;
    const existing = entries.find(e => e.habitId === habitId && e.date === date);
    let updated: HabitEntry[];

    if (existing) {
      updated = entries.map(e =>
        e.id === existing.id ? { ...e, skipped: true, skipReason: reason, count: 0 } : e
      );
    } else {
      updated = [...entries, {
        id: uid(),
        habitId,
        date,
        count: 0,
        completedAt: new Date().toISOString(),
        skipped: true,
        skipReason: reason,
      }];
    }

    await saveEntries(updated);
    set({ entries: updated });
  },

  unmark: async (habitId, date) => {
    const updated = get().entries.filter(e => !(e.habitId === habitId && e.date === date));
    await saveEntries(updated);
    set({ entries: updated });
  },

  getEntriesForHabit: (habitId) =>
    get().entries.filter(e => e.habitId === habitId),

  getEntryForDate: (habitId, date) =>
    get().entries.find(e => e.habitId === habitId && e.date === date) ?? null,

  getStatsForHabit: (habitId) => {
    const habit = get().habits.find(h => h.id === habitId);
    if (!habit) return null;
    return calculateHabitStats(habit, get().getEntriesForHabit(habitId));
  },

  getHabitsScheduledToday: () => {
    const day = new Date().getDay();
    return get().habits
      .filter(h => !h.archivedAt)
      .filter(h => {
        if (h.frequency.type === 'daily') return true;
        if (h.frequency.type === 'weekly') return h.frequency.days.includes(day);
        return true;
      })
      .sort((a, b) => {
        const at = a.schedule?.time ?? '23:59';
        const bt = b.schedule?.time ?? '23:59';
        return at !== bt ? at.localeCompare(bt) : a.order - b.order;
      });
  },

  getActiveHabits: () =>
    get().habits.filter(h => !h.archivedAt).sort((a, b) => a.order - b.order),
}));
