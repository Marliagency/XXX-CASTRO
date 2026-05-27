import { useEffect } from 'react';
import { format } from 'date-fns';
import { useHabitsStore } from '../store/habitsStore';

export function useHabits() {
  const store = useHabitsStore();

  useEffect(() => {
    if (!store.loaded) {
      store.loadFromStorage();
    }
  }, [store.loaded, store.loadFromStorage]);

  const todayStr = format(new Date(), 'yyyy-MM-dd');

  const todayHabits = store.getHabitsScheduledToday().map(habit => ({
    ...habit,
    entry: store.getEntryForDate(habit.id, todayStr),
    stats: store.getStatsForHabit(habit.id),
  }));

  const completedToday = todayHabits.filter(h => {
    if (!h.entry || h.entry.skipped) return false;
    if (h.type === 'count') return h.entry.count >= (h.targetCount ?? 1);
    return h.entry.count > 0;
  }).length;

  const totalToday = todayHabits.length;

  return {
    habits: store.getActiveHabits(),
    todayHabits,
    completedToday,
    totalToday,
    loaded: store.loaded,
    addHabit: store.addHabit,
    updateHabit: store.updateHabit,
    archiveHabit: store.archiveHabit,
    deleteHabit: store.deleteHabit,
    markComplete: store.markComplete,
    decrementCount: store.decrementCount,
    markSkipped: store.markSkipped,
    unmark: store.unmark,
    getEntriesForHabit: store.getEntriesForHabit,
    getStatsForHabit: store.getStatsForHabit,
    getEntryForDate: store.getEntryForDate,
  };
}
