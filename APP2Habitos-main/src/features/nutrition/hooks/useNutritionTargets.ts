import { useActiveGoal } from '../../goals/hooks/useActiveGoal';
import { useNutritionStore } from '../store/nutritionStore';
import { useUserProfile } from '../../user/hooks/useUserProfile';
import type { NutritionTargets } from '../types';

export type NutritionTargetsSource = 'manual' | 'goal' | 'profile';

export interface ResolvedNutritionTargets extends NutritionTargets {
  source: NutritionTargetsSource;
}

const GOAL_CALORIE_ADJUSTMENT: Record<string, number> = {
  lose_weight:     -300,
  maintain:        0,
  gain_muscle:     +200,
  improve_fitness: 0,
  build_habits:    0,
};

/**
 * Returns the effective nutrition targets:
 * 1. Manual targets (nutritionStore) — highest priority
 * 2. Active goal's derived targets
 * 3. Profile BMR/TDEE with goal adjustment — computed automatically
 * 4. null — when none of the above exist
 */
export function useNutritionTargets(): ResolvedNutritionTargets | null {
  const storeTargets = useNutritionStore(s => s.targets);
  const { derived }  = useActiveGoal();
  const { profile, tdee } = useUserProfile();

  if (storeTargets) {
    return { ...storeTargets, source: 'manual' };
  }

  if (derived?.nutritionTargets) {
    return { ...derived.nutritionTargets, source: 'goal' };
  }

  // Derive from profile TDEE + goal
  if (tdee && profile) {
    const adjustment = profile.goal ? (GOAL_CALORIE_ADJUSTMENT[profile.goal] ?? 0) : 0;
    const calories   = Math.round(tdee + adjustment);

    // Macro split depends on goal
    let proteinRatio = 0.25;
    let fatRatio     = 0.30;
    if (profile.goal === 'gain_muscle') { proteinRatio = 0.30; fatRatio = 0.25; }
    if (profile.goal === 'lose_weight') { proteinRatio = 0.30; fatRatio = 0.30; }

    const proteinCals = calories * proteinRatio;
    const fatCals     = calories * fatRatio;
    const carbsCals   = calories - proteinCals - fatCals;

    return {
      source:  'profile',
      calories,
      protein: Math.round(proteinCals / 4),
      carbs:   Math.round(carbsCals / 4),
      fat:     Math.round(fatCals / 9),
    };
  }

  return null;
}
