import { useState } from 'react';
import { useUserStore } from '../../user/store/userStore';
import { ACTIVITY_LEVELS } from '../../user/types';
import { PageHeader } from '../../../shared/components/layout/PageHeader';
import { Button } from '../../../shared/components/ui';
import { useToast } from '../../../shared/components/ui';
import type { Sex } from '../../user/types';

const SEX_OPTIONS: { value: Sex; label: string; emoji: string }[] = [
  { value: 'male',              label: 'Hombre',              emoji: '♂️' },
  { value: 'female',            label: 'Mujer',               emoji: '♀️' },
  { value: 'other',             label: 'Otro',                emoji: '⚧' },
  { value: 'prefer_not_to_say', label: 'No especificado',     emoji: '—' },
];

export default function ProfileSettingsView() {
  const { profile, updateProfile, getAge, getBMR, getTDEE } = useUserStore();
  const { toast } = useToast();

  const [name,          setName]         = useState(profile?.name ?? '');
  const [birthDate,     setBirthDate]    = useState(profile?.birthDate ?? '');
  const [sex,           setSex]          = useState<Sex | null>(profile?.sex ?? null);
  const [heightCm,      setHeightCm]     = useState(profile?.heightCm ?? null as number | null);
  const [weightKg,      setWeightKg]     = useState(profile?.weightKg ?? null as number | null);
  const [targetWeightKg,setTargetWeight] = useState(profile?.targetWeightKg ?? null as number | null);
  const [activityLevel, setActivityLevel] = useState(profile?.activityLevel ?? null as string | null);
  const [saving,        setSaving]       = useState(false);

  const age  = getAge();
  const bmr  = getBMR();
  const tdee = getTDEE();

  const handleSave = async () => {
    setSaving(true);
    await updateProfile({
      name:          name.trim() || (profile?.name ?? ''),
      birthDate:     birthDate || null,
      sex:           sex ?? undefined,
      heightCm:      heightCm ?? undefined,
      weightKg:      weightKg ?? undefined,
      targetWeightKg: targetWeightKg ?? undefined,
      activityLevel: (activityLevel as any) ?? undefined,
    });
    setSaving(false);
    toast('Perfil actualizado', 'success');
  };

  return (
    <div className="page-content pb-24">
      <PageHeader title="Editar perfil" backButton />

      <div className="space-y-6 mt-2">
        {/* Name */}
        <div className="section-group">
          <p className="section-header">Datos personales</p>
          <div className="section-body px-4 py-4 space-y-4">
            <div className="space-y-1.5">
              <label className="label-caps text-[var(--text-tertiary)]">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full h-12 px-4 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--r-lg)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="label-caps text-[var(--text-tertiary)]">Fecha de nacimiento</label>
              <input
                type="date"
                value={birthDate}
                onChange={e => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full h-12 px-4 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--r-lg)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
              {age !== null && (
                <p className="text-xs text-[var(--text-tertiary)]">{age} años</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="label-caps text-[var(--text-tertiary)]">Sexo biológico</label>
              <div className="grid grid-cols-2 gap-2">
                {SEX_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSex(opt.value)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-[var(--r-lg)] border-2 text-sm font-medium transition-all text-left touch-compact"
                    style={{ minHeight: 'unset' }}
                    aria-pressed={sex === opt.value}
                  >
                    <span>{opt.emoji}</span>
                    <span style={{
                      color: sex === opt.value ? 'var(--accent)' : 'var(--text-secondary)',
                    }}>
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Physical */}
        <div className="section-group">
          <p className="section-header">Datos físicos</p>
          <p className="section-footer" style={{ paddingBottom: 8 }}>
            Usados para calcular tu metabolismo y macros automáticamente.
          </p>
          <div className="section-body px-4 py-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="label-caps text-[var(--text-tertiary)]">Altura (cm)</label>
                <input
                  type="number"
                  value={heightCm ?? ''}
                  onChange={e => setHeightCm(e.target.value ? Number(e.target.value) : null)}
                  placeholder="175"
                  min={100} max={250}
                  className="w-full h-12 px-4 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--r-lg)] text-[var(--text-primary)] text-center font-semibold focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="label-caps text-[var(--text-tertiary)]">Peso actual (kg)</label>
                <input
                  type="number"
                  value={weightKg ?? ''}
                  onChange={e => setWeightKg(e.target.value ? Number(e.target.value) : null)}
                  placeholder="70"
                  min={30} max={300} step={0.1}
                  className="w-full h-12 px-4 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--r-lg)] text-[var(--text-primary)] text-center font-semibold focus:outline-none focus:border-[var(--accent)] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="label-caps text-[var(--text-tertiary)]">Peso objetivo (kg) — opcional</label>
              <input
                type="number"
                value={targetWeightKg ?? ''}
                onChange={e => setTargetWeight(e.target.value ? Number(e.target.value) : null)}
                placeholder="Sin objetivo de peso"
                min={30} max={300} step={0.1}
                className="w-full h-12 px-4 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--r-lg)] text-[var(--text-primary)] text-center font-semibold focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="label-caps text-[var(--text-tertiary)]">Nivel de actividad</label>
              <div className="space-y-2">
                {ACTIVITY_LEVELS.map(level => (
                  <button
                    key={level.value}
                    onClick={() => setActivityLevel(level.value)}
                    className="w-full flex items-center gap-3 p-3 rounded-[var(--r-xl)] border-2 text-left transition-all"
                    style={{
                      borderColor: activityLevel === level.value ? 'var(--accent)' : 'var(--border-default)',
                      background:  activityLevel === level.value ? 'var(--accent-subtle)' : 'var(--bg-base)',
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{level.label}</p>
                      <p className="text-xs text-[var(--text-secondary)]">{level.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Computed metabolics */}
            {(bmr || tdee) && (
              <div className="flex gap-4 p-3 bg-[var(--accent-subtle)] rounded-[var(--r-xl)]">
                {bmr && (
                  <div className="text-center">
                    <p className="text-xl font-bold text-[var(--accent)]">{bmr}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">TMB kcal</p>
                  </div>
                )}
                {tdee && (
                  <div className="text-center">
                    <p className="text-xl font-bold text-[var(--accent)]">{tdee}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">TDEE kcal</p>
                  </div>
                )}
                <p className="flex-1 text-xs text-[var(--text-secondary)] self-center leading-relaxed">
                  Valores calculados automáticamente con la fórmula Mifflin-St Jeor
                </p>
              </div>
            )}
          </div>
        </div>

        <Button
          variant="gradient"
          size="lg"
          className="w-full"
          loading={saving}
          onClick={handleSave}
        >
          Guardar cambios
        </Button>
      </div>
    </div>
  );
}
