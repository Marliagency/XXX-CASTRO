import { useState } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import clsx from 'clsx';
import { Button } from '../../../shared/components/ui';
import { calcNutritionTargets, ACTIVITY_LABELS, GOAL_LABELS } from '../types';
import type { NutritionTargets } from '../types';
import { useNutritionStore } from '../store/nutritionStore';

type Profile = NonNullable<NutritionTargets['profile']>;

const STEPS = ['Datos básicos', 'Actividad', 'Objetivo', 'Resultado'] as const;

interface Props {
  onDone: () => void;
}

export function NutritionTargetsWizard({ onDone }: Props) {
  const { setTargets } = useNutritionStore();
  const [step, setStep]     = useState(0);
  const [profile, setProfile] = useState<Partial<Profile>>({
    sex: 'male',
    activityLevel: 'moderate',
    goal: 'maintain',
  });

  const update = (patch: Partial<Profile>) => setProfile(p => ({ ...p, ...patch }));
  const computed = step === 3 && profile.age && profile.weightKg && profile.heightCm
    ? calcNutritionTargets(profile as Profile)
    : null;

  const canNext = () => {
    if (step === 0) return !!(profile.age && profile.weightKg && profile.heightCm && profile.sex);
    if (step === 1) return !!profile.activityLevel;
    if (step === 2) return !!profile.goal;
    return true;
  };

  const handleSave = async () => {
    if (!computed) return;
    await setTargets(computed);
    onDone();
  };

  return (
    <div className="space-y-6">
      {/* Step indicators */}
      <div className="flex gap-1">
        {STEPS.map((label, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={clsx(
              'w-full h-1 rounded-full transition-colors',
              i <= step ? 'bg-[var(--accent)]' : 'bg-[var(--bg-base)]',
            )} />
            <span className="text-[9px] text-[var(--text-tertiary)] hidden sm:block">{label}</span>
          </div>
        ))}
      </div>

      {/* Step 0: Basic data */}
      {step === 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Datos personales</h3>

          <div className="space-y-1.5">
            <label className="text-xs text-[var(--text-secondary)]">Sexo</label>
            <div className="flex gap-2">
              {(['male', 'female'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => update({ sex: s })}
                  className={clsx(
                    'flex-1 py-2 text-sm rounded-[var(--r-lg)] border transition-colors',
                    profile.sex === s
                      ? 'border-[var(--accent)] bg-[var(--accent)] text-white'
                      : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
                  )}
                >
                  {s === 'male' ? 'Hombre' : 'Mujer'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Edad', key: 'age', unit: 'años', min: 15, max: 80 },
              { label: 'Peso', key: 'weightKg', unit: 'kg', min: 30, max: 250 },
              { label: 'Altura', key: 'heightCm', unit: 'cm', min: 100, max: 250 },
            ].map(f => (
              <div key={f.key} className="space-y-1">
                <label className="text-xs text-[var(--text-secondary)]">{f.label}</label>
                <div className="relative">
                  <input
                    type="number"
                    value={(profile as Record<string, number | undefined>)[f.key] ?? ''}
                    onChange={e => update({ [f.key]: e.target.value ? Number(e.target.value) : undefined } as Partial<Profile>)}
                    min={f.min}
                    max={f.max}
                    className="w-full h-9 px-2 pr-6 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
                    placeholder="—"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-[var(--text-tertiary)]">{f.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Activity */}
      {step === 1 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Nivel de actividad</h3>
          {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => update({ activityLevel: key as Profile['activityLevel'] })}
              className={clsx(
                'w-full text-left px-4 py-3 rounded-[var(--r-lg)] border text-sm transition-colors',
                profile.activityLevel === key
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)]'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Goal */}
      {step === 2 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Objetivo principal</h3>
          {Object.entries(GOAL_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => update({ goal: key as Profile['goal'] })}
              className={clsx(
                'w-full text-left px-4 py-3 rounded-[var(--r-lg)] border text-sm transition-colors',
                profile.goal === key
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--text-primary)]'
                  : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]',
              )}
            >
              <p className="font-medium">{label}</p>
              <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                {key === 'lose' ? '-500 kcal/día respecto al TDEE' : key === 'gain' ? '+300 kcal/día respecto al TDEE' : 'Igualar tu TDEE'}
              </p>
            </button>
          ))}
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && computed && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Tus objetivos calculados</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Calorías', value: computed.calories, unit: 'kcal', color: 'var(--accent)' },
              { label: 'Proteínas', value: computed.protein, unit: 'g/día', color: 'var(--nutrition-color)' },
              { label: 'Carbohidratos', value: computed.carbs, unit: 'g/día', color: 'var(--warning)' },
              { label: 'Grasas', value: computed.fat, unit: 'g/día', color: 'var(--journal-color)' },
            ].map(m => (
              <div key={m.label} className="bg-[var(--bg-base)] rounded-[var(--r-lg)] p-3 text-center">
                <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">{m.unit}</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5">{m.label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-[var(--text-tertiary)] text-center">
            Basado en la fórmula Mifflin-St Jeor. Revisa con un profesional de salud.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-2">
        {step > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setStep(s => s - 1)} className="flex-1">
            Atrás
          </Button>
        )}
        {step < 3 ? (
          <Button
            variant="primary" size="sm" disabled={!canNext()}
            onClick={() => setStep(s => s + 1)}
            icon={<ChevronRight size={14} />}
            className="flex-1"
          >
            Siguiente
          </Button>
        ) : (
          <Button variant="primary" size="sm" icon={<Check size={14} />} onClick={handleSave} className="flex-1">
            Guardar objetivos
          </Button>
        )}
      </div>
    </div>
  );
}
