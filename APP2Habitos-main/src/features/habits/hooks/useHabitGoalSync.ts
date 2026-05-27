import { useMemo } from 'react';
import { useActiveGoal } from '../../goals/hooks/useActiveGoal';
import { useHabitsStore } from '../store/habitsStore';

export function useHabitGoalSync() {
  const { derived } = useActiveGoal();
  const habits = useHabitsStore(s => s.habits);

  const pendingSuggestions = useMemo(() => {
    if (!derived?.habitSuggestions?.length) return [];

    const activeNames = habits
      .filter(h => !h.archivedAt)
      .map(h => h.name.toLowerCase());

    return derived.habitSuggestions.filter(suggestion => {
      const suggLower = suggestion.toLowerCase();
      // Skip if any existing habit name overlaps significantly with suggestion
      return !activeNames.some(name => {
        const words = name.split(/\s+/).filter(w => w.length > 3);
        return words.some(w => suggLower.includes(w)) || name.includes(suggLower.slice(0, 6));
      });
    });
  }, [derived, habits]);

  return {
    hasSuggestions: pendingSuggestions.length > 0,
    suggestions: pendingSuggestions,
    intent: derived?.intent ?? null,
  };
}
