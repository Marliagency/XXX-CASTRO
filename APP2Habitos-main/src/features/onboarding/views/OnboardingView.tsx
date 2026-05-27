import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { QyroLogo } from '../../../shared/components/ui/QyroLogo';
import { useUserStore } from '../../user/store/userStore';
import { ACTIVITY_LEVELS, GOALS } from '../../user/types';
import type { Sex, ActivityLevel, Goal } from '../../user/types';

interface OnboardingViewProps {
  onComplete: () => void;
}

const TOTAL_STEPS = 8;

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all duration-300"
          style={{
            background: i < step
              ? 'var(--qyro-grad)'
              : i === step
              ? 'rgba(66,165,245,0.4)'
              : 'var(--border-default)',
          }}
        />
      ))}
    </div>
  );
}

export function OnboardingView({ onComplete }: OnboardingViewProps) {
  const { profile, updateProfile, completeOnboarding } = useUserStore();
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
  };
  const prev = () => { if (step > 0) setStep(s => s - 1); };

  const finish = async () => {
    await completeOnboarding();
    onComplete();
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-void)]">
      {/* Header */}
      <div className="px-5 pt-6 pb-4" style={{ paddingTop: 'max(24px, var(--safe-top))' }}>
        <div className="flex items-center justify-between mb-4">
          <QyroLogo size={24} showText />
          <span className="text-xs text-[var(--text-tertiary)] font-medium">
            {step + 1} / {TOTAL_STEPS}
          </span>
        </div>
        <ProgressBar step={step} />
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-5 py-4">
        {step === 0 && <Step0Welcome name={profile?.name ?? ''} />}
        {step === 1 && (
          <Step1Sex
            value={profile?.sex ?? null}
            onChange={v => updateProfile({ sex: v })}
          />
        )}
        {step === 2 && (
          <Step2BirthDate
            value={profile?.birthDate ?? ''}
            onChange={v => updateProfile({ birthDate: v })}
          />
        )}
        {step === 3 && (
          <Step3Height
            value={profile?.heightCm ?? null}
            onChange={v => updateProfile({ heightCm: v })}
          />
        )}
        {step === 4 && (
          <Step4Weight
            value={profile?.weightKg ?? null}
            target={profile?.targetWeightKg ?? null}
            onChange={(w, t) => updateProfile({ weightKg: w, targetWeightKg: t })}
          />
        )}
        {step === 5 && (
          <Step5Activity
            value={profile?.activityLevel ?? null}
            onChange={v => updateProfile({ activityLevel: v })}
          />
        )}
        {step === 6 && (
          <Step6Goal
            value={profile?.goal ?? null}
            onChange={v => updateProfile({ goal: v })}
          />
        )}
        {step === 7 && <Step7Done name={profile?.name ?? ''} />}
      </div>

      {/* Navigation */}
      <div
        className="px-5 pb-8 flex gap-3"
        style={{ paddingBottom: 'max(32px, calc(var(--safe-bottom) + 24px))' }}
      >
        {step > 0 && (
          <Button
            variant="secondary"
            size="lg"
            icon={<ChevronLeft size={18} />}
            onClick={prev}
            className="w-14 shrink-0"
          />
        )}
        {step < TOTAL_STEPS - 1 ? (
          <Button
            variant="gradient"
            size="lg"
            className="flex-1"
            iconPosition="right"
            icon={<ChevronRight size={18} />}
            onClick={next}
          >
            Continuar
          </Button>
        ) : (
          <Button
            variant="gradient"
            size="lg"
            className="flex-1"
            iconPosition="right"
            icon={<Check size={18} />}
            onClick={finish}
          >
            ¡Empezar con QYRO!
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── Individual step components ──────────────────────────────────────────── */

function Step0Welcome({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center text-center pt-8 gap-6">
      <div className="w-20 h-20 rounded-[24px] flex items-center justify-center" style={{ background: 'var(--qyro-grad)' }}>
        <span className="text-4xl">👋</span>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          Hola, {name || 'amigo'}!
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Vamos a configurar tu perfil para que QYRO pueda personalizarse para ti.
          Solo tardará un par de minutos.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3 w-full mt-4">
        {[
          { emoji: '📊', label: 'Estadísticas\npersonalizadas' },
          { emoji: '🎯', label: 'Metas\nadaptadas' },
          { emoji: '🧮', label: 'Calorías\ncalculadas' },
        ].map(({ emoji, label }) => (
          <div
            key={label}
            className="p-3 bg-[var(--bg-surface)] rounded-[var(--r-xl)] border border-[var(--border-subtle)] text-center"
          >
            <span className="text-2xl block mb-1">{emoji}</span>
            <span className="text-[10px] font-semibold text-[var(--text-secondary)] whitespace-pre-line">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step1Sex({ value, onChange }: { value: Sex | null; onChange: (v: Sex) => void }) {
  const options: { value: Sex; label: string; emoji: string }[] = [
    { value: 'male',              label: 'Hombre',              emoji: '♂️' },
    { value: 'female',            label: 'Mujer',               emoji: '♀️' },
    { value: 'other',             label: 'Otro',                emoji: '⚧' },
    { value: 'prefer_not_to_say', label: 'Prefiero no decirlo', emoji: '🤐' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">¿Cuál es tu sexo biológico?</h2>
        <p className="text-sm text-[var(--text-secondary)]">Se usa para calcular tu metabolismo basal</p>
      </div>
      <div className="space-y-3">
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="w-full flex items-center gap-4 p-4 rounded-[var(--r-xl)] border-2 transition-all text-left"
            style={{
              borderColor: value === opt.value ? 'var(--accent)' : 'var(--border-default)',
              background: value === opt.value ? 'var(--accent-subtle)' : 'var(--bg-surface)',
            }}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="font-semibold text-[var(--text-primary)]">{opt.label}</span>
            {value === opt.value && (
              <span className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--qyro-grad)' }}>
                <Check size={11} color="white" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step2BirthDate({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">¿Cuándo naciste?</h2>
        <p className="text-sm text-[var(--text-secondary)]">Necesitamos tu edad para calcular tus necesidades calóricas</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Fecha de nacimiento
        </label>
        <input
          type="date"
          value={value}
          onChange={e => onChange(e.target.value)}
          max={new Date().toISOString().split('T')[0]}
          min="1920-01-01"
          className="w-full h-12 px-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-lg)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
        />
      </div>
      {value && (
        <div className="p-4 bg-[var(--accent-subtle)] rounded-[var(--r-xl)] text-center">
          <p className="text-sm text-[var(--text-secondary)]">Tu edad</p>
          <p className="text-3xl font-bold text-[var(--accent)]">
            {new Date().getFullYear() - new Date(value).getFullYear()} años
          </p>
        </div>
      )}
    </div>
  );
}

function Step3Height({ value, onChange }: { value: number | null; onChange: (v: number | null) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">¿Cuánto mides?</h2>
        <p className="text-sm text-[var(--text-secondary)]">Tu altura en centímetros</p>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
          Altura (cm)
        </label>
        <input
          type="number"
          value={value ?? ''}
          onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
          placeholder="170"
          min={100}
          max={250}
          className="w-full h-14 px-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-lg)] text-[var(--text-primary)] text-2xl font-bold text-center focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
        />
        <p className="text-xs text-center text-[var(--text-tertiary)]">centímetros</p>
      </div>
    </div>
  );
}

function Step4Weight({
  value, target, onChange
}: {
  value: number | null;
  target: number | null;
  onChange: (weight: number | null, target: number | null) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">¿Cuánto pesas?</h2>
        <p className="text-sm text-[var(--text-secondary)]">Tu peso actual y objetivo</p>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Peso actual (kg)
          </label>
          <input
            type="number"
            value={value ?? ''}
            onChange={e => onChange(e.target.value ? Number(e.target.value) : null, target)}
            placeholder="70"
            min={30}
            max={300}
            step={0.1}
            className="w-full h-14 px-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-lg)] text-[var(--text-primary)] text-2xl font-bold text-center focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
            Peso objetivo (kg) — opcional
          </label>
          <input
            type="number"
            value={target ?? ''}
            onChange={e => onChange(value, e.target.value ? Number(e.target.value) : null)}
            placeholder="65"
            min={30}
            max={300}
            step={0.1}
            className="w-full h-14 px-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-lg)] text-[var(--text-primary)] text-2xl font-bold text-center focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
          />
        </div>
        {value && target && (
          <div className="p-4 bg-[var(--bg-surface)] rounded-[var(--r-xl)] border border-[var(--border-subtle)] text-center">
            <p className="text-sm text-[var(--text-secondary)]">Diferencia</p>
            <p className={`text-2xl font-bold ${target < value ? 'text-[var(--danger)]' : 'text-[var(--success)]'}`}>
              {target < value ? '−' : '+'}{Math.abs(target - value).toFixed(1)} kg
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Step5Activity({ value, onChange }: { value: ActivityLevel | null; onChange: (v: ActivityLevel) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">Nivel de actividad</h2>
        <p className="text-sm text-[var(--text-secondary)]">¿Con qué frecuencia haces ejercicio?</p>
      </div>
      <div className="space-y-2">
        {ACTIVITY_LEVELS.map(level => (
          <button
            key={level.value}
            onClick={() => onChange(level.value)}
            className="w-full flex items-center gap-3 p-4 rounded-[var(--r-xl)] border-2 transition-all text-left"
            style={{
              borderColor: value === level.value ? 'var(--accent)' : 'var(--border-default)',
              background: value === level.value ? 'var(--accent-subtle)' : 'var(--bg-surface)',
            }}
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--text-primary)] text-sm">{level.label}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{level.description}</p>
            </div>
            {value === level.value && (
              <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--qyro-grad)' }}>
                <Check size={11} color="white" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step6Goal({ value, onChange }: { value: Goal | null; onChange: (v: Goal) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">¿Cuál es tu objetivo?</h2>
        <p className="text-sm text-[var(--text-secondary)]">Elige el que mejor describe tu meta principal</p>
      </div>
      <div className="space-y-2">
        {GOALS.map(goal => (
          <button
            key={goal.value}
            onClick={() => onChange(goal.value)}
            className="w-full flex items-center gap-4 p-4 rounded-[var(--r-xl)] border-2 transition-all text-left"
            style={{
              borderColor: value === goal.value ? 'var(--accent)' : 'var(--border-default)',
              background: value === goal.value ? 'var(--accent-subtle)' : 'var(--bg-surface)',
            }}
          >
            <span className="text-2xl shrink-0">{goal.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--text-primary)] text-sm">{goal.label}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{goal.description}</p>
            </div>
            {value === goal.value && (
              <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--qyro-grad)' }}>
                <Check size={11} color="white" />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step7Done({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center text-center pt-8 gap-6">
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center shadow-[var(--qyro-grad-glow)]"
        style={{ background: 'var(--qyro-grad)' }}
      >
        <Check size={40} color="white" strokeWidth={2.5} />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
          ¡Listo, {name || 'campeón'}!
        </h2>
        <p className="text-[var(--text-secondary)] leading-relaxed">
          Tu perfil está configurado. QYRO usará esta información para personalizar todas tus estadísticas y recomendaciones.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 w-full mt-2">
        {[
          { emoji: '🔥', label: 'Calorías calculadas con tu TMB' },
          { emoji: '💪', label: 'Objetivos adaptados a tu meta' },
          { emoji: '📈', label: 'Progreso visible desde el día 1' },
          { emoji: '🎯', label: 'Todo sincronizado en tu perfil' },
        ].map(({ emoji, label }) => (
          <div
            key={label}
            className="p-3 bg-[var(--bg-surface)] rounded-[var(--r-xl)] border border-[var(--border-subtle)] text-left"
          >
            <span className="text-xl block mb-1">{emoji}</span>
            <span className="text-xs font-medium text-[var(--text-secondary)]">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
