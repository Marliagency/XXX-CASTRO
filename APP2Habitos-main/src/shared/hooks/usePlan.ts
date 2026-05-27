import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PlanTier, UserPlan } from '../types';

const PRO_FEATURES = [
  'ai_assistant',
  'unlimited_habits',
  'advanced_analytics',
  'workout_templates_premium',
  'nutrition_adaptive',
  'journal_ai_insights',
  'data_export',
  'custom_themes',
] as const;

type ProFeature = typeof PRO_FEATURES[number];

interface PlanStore {
  plan: UserPlan;
  setPlan: (plan: UserPlan) => void;
  hasFeature: (feature: ProFeature) => boolean;
}

export const usePlan = create<PlanStore>()(
  persist(
    (set, get) => ({
      plan: { tier: 'free' as PlanTier, expiresAt: null },
      setPlan: (plan) => set({ plan }),
      hasFeature: (_feature: ProFeature) => {
        const tier = get().plan.tier;
        // During beta, all features available
        return tier === 'pro' || tier === 'lifetime' || true;
      },
    }),
    { name: 'app.billing.v1' }
  )
);
