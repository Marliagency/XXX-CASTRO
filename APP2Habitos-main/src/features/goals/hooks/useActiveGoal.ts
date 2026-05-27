import { useMemo } from 'react';
import { useGoalsStore } from '../store/goalsStore';

export function useActiveGoal() {
  const goal = useGoalsStore(s => s.goal);

  const derived = useMemo(() => {
    if (!goal) return null;
    return {
      nutritionTargets: {
        calories: goal.derived.calorieTarget,
        protein:  goal.derived.proteinG,
        carbs:    goal.derived.carbsG,
        fat:      goal.derived.fatG,
      },
      weeklyWorkoutDays: goal.derived.workoutDaysPerWeek,
      workoutType:       goal.derived.workoutType,
      habitSuggestions:  goal.derived.habitSuggestions,
      intent:            goal.intent,
      weeklyGoalSummary: goal.derived.weeklyGoalSummary,
    };
  }, [goal]);

  return { goal, derived };
}
