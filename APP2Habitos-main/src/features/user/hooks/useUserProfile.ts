import { useMemo } from 'react';
import { useUserStore } from '../store/userStore';
import { ACTIVITY_LEVELS } from '../types';

function calcAge(birthDate: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

function calcBMR(
  weightKg: number | null,
  heightCm: number | null,
  age: number | null,
  sex: string | null
): number | null {
  if (!weightKg || !heightCm || !age || !sex) return null;
  // Mifflin-St Jeor
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function useUserProfile() {
  const profile = useUserStore(s => s.profile);

  return useMemo(() => {
    if (!profile) return { profile: null, age: null, bmr: null, tdee: null, initials: '', isComplete: false };

    const age = calcAge(profile.birthDate);
    const bmr = calcBMR(profile.weightKg, profile.heightCm, age, profile.sex);
    const activityConfig = ACTIVITY_LEVELS.find(l => l.value === profile.activityLevel);
    const tdee = bmr && activityConfig ? Math.round(bmr * activityConfig.multiplier) : null;

    const initials = profile.name
      .split(' ')
      .slice(0, 2)
      .map(w => w[0]?.toUpperCase() ?? '')
      .join('');

    const isComplete =
      !!profile.sex &&
      !!profile.birthDate &&
      !!profile.heightCm &&
      !!profile.weightKg &&
      !!profile.activityLevel &&
      !!profile.goal;

    const completionFields = [
      profile.sex,
      profile.birthDate,
      profile.heightCm,
      profile.weightKg,
      profile.activityLevel,
      profile.goal,
    ];
    const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

    return { profile, age, bmr: bmr ? Math.round(bmr) : null, tdee, initials, isComplete, completionPct };
  }, [profile]);
}
