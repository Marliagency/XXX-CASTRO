import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BadHabit, BadHabitMilestone } from '../types/badHabits';
import { DEFAULT_MILESTONES } from '../types/badHabits';

const uid = () => crypto.randomUUID();
const now = () => new Date().toISOString();

interface BadHabitsState {
  badHabits: BadHabit[];

  addBadHabit:    (habit: Omit<BadHabit, 'id' | 'createdAt'>) => void;
  removeBadHabit: (id: string) => void;
  updateBadHabit: (id: string, updates: Partial<BadHabit>) => void;
  resetSobriety:  (id: string, note?: string, trigger?: string) => void;

  // Computed helpers
  getDaysSober:        (id: string) => number;
  getHoursSober:       (id: string) => number;
  getSavingsAmount:    (id: string) => number;
  getNextMilestone:    (id: string) => BadHabitMilestone | null;
  checkAndGrantMilestones: (id: string) => void;
}

export const useBadHabitsStore = create<BadHabitsState>()(
  persist(
    (set, get) => ({
      badHabits: [],

      addBadHabit: (habit) => {
        const newHabit: BadHabit = {
          ...habit,
          id:        uid(),
          createdAt: now(),
          relapses:  [],
          milestones: DEFAULT_MILESTONES.map(m => ({ ...m })),
        };
        set(s => ({ badHabits: [...s.badHabits, newHabit] }));
      },

      removeBadHabit: (id) => {
        set(s => ({ badHabits: s.badHabits.filter(h => h.id !== id) }));
      },

      updateBadHabit: (id, updates) => {
        set(s => ({
          badHabits: s.badHabits.map(h => h.id === id ? { ...h, ...updates } : h),
        }));
      },

      resetSobriety: (id, note, trigger) => {
        set(s => ({
          badHabits: s.badHabits.map(h => {
            if (h.id !== id) return h;
            return {
              ...h,
              startDate: now(),
              relapses: [
                ...h.relapses,
                { date: now(), note, trigger },
              ],
              milestones: DEFAULT_MILESTONES.map(m => ({ ...m })),
            };
          }),
        }));
      },

      getDaysSober: (id) => {
        const habit = get().badHabits.find(h => h.id === id);
        if (!habit) return 0;
        const diffMs = Date.now() - new Date(habit.startDate).getTime();
        return Math.floor(diffMs / (1000 * 60 * 60 * 24));
      },

      getHoursSober: (id) => {
        const habit = get().badHabits.find(h => h.id === id);
        if (!habit) return 0;
        const diffMs = Date.now() - new Date(habit.startDate).getTime();
        return Math.floor(diffMs / (1000 * 60 * 60));
      },

      getSavingsAmount: (id) => {
        const habit = get().badHabits.find(h => h.id === id);
        if (!habit?.savings?.costPerUnit || !habit.savings.unitsPerDay) return 0;
        const days = get().getDaysSober(id);
        return Number((days * habit.savings.unitsPerDay * habit.savings.costPerUnit).toFixed(2));
      },

      getNextMilestone: (id) => {
        const habit = get().badHabits.find(h => h.id === id);
        if (!habit) return null;
        const days = get().getDaysSober(id);
        return habit.milestones.find(m => m.days > days && !m.reached) ?? null;
      },

      checkAndGrantMilestones: (id) => {
        const days = get().getDaysSober(id);
        set(s => ({
          badHabits: s.badHabits.map(h => {
            if (h.id !== id) return h;
            return {
              ...h,
              milestones: h.milestones.map(m => ({
                ...m,
                reached: m.reached || m.days <= days,
              })),
            };
          }),
        }));
      },
    }),
    {
      name: 'qyro.badHabits.v1',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
