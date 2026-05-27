import { useActiveGoal } from '../../goals/hooks/useActiveGoal';

export function useWorkoutGoal() {
  const { derived } = useActiveGoal();

  return {
    weeklyTarget: derived?.weeklyWorkoutDays ?? 3,
    workoutType:  derived?.workoutType ?? null,
    hasGoal:      !!derived,
  };
}
