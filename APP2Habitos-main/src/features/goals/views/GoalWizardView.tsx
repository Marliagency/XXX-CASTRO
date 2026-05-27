import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Check, Target, Info } from 'lucide-react';
import { useGoalsStore } from '../store/goalsStore';
import { useUserStore } from '../../user/store/userStore';
import { inferGoalTargets } from '../utils/goalInference';
import {
  INTENT_LABELS, INTENT_DESCRIPTIONS, INTENT_EMOJIS,
  ACTIVITY_LABELS, PRIORITY_LABELS, PRIORITY_EMOJIS,
} from '../types';
import type { LifeIntent, BodyProfile, TimeBudget, PriorityArea, ActivityLevel, Sex } from '../types';
import { Button } from '../../../shared/components/ui';
import { useToast } from '../../../shared/components/ui';

const INTENTS: LifeIntent[]      = ['lose_fat','build_muscle','improve_health','boost_productivity','reduce_stress','athletic_performance'];
const PRIORITY_AREAS: PriorityArea[] = ['fitness','nutrition','habits','mental','productivity'];
const ACTIVITIES: ActivityLevel[] = ['sedentary','light','moderate','active','very_active'];

const STEPS = ['Objetivo', 'Perfil', 'Tiempo', 'Prioridades', 'Recomendaciones', 'Resumen'];

// ─── Step components ──────────────────────────────────────────────────────────

function StepLifeIntent({ value, onChange }: { value: LifeIntent | null; onChange: (v: LifeIntent) => void }) {
  return (
    <div className="space-y-3">
      <div className="text-center mb-5">
        <Target size={28} className="mx-auto text-[var(--accent)] mb-2" />
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">¿Cuál es tu objetivo principal?</h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Elige uno — podrás cambiarlo después.</p>
      </div>
      {INTENTS.map(intent => (
        <button
          key={intent}
          onClick={() => onChange(intent)}
          className={`w-full flex items-start gap-3 px-4 py-3.5 rounded-[var(--r-xl)] border text-left transition-all ${
            value === intent
              ? 'bg-[var(--accent)]/10 border-[var(--accent)] ring-1 ring-[var(--accent)]'
              : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'
          }`}
        >
          <span className="text-2xl shrink-0">{INTENT_EMOJIS[intent]}</span>
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">{INTENT_LABELS[intent]}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{INTENT_DESCRIPTIONS[intent]}</p>
          </div>
          {value === intent && <Check size={16} className="text-[var(--accent)] ml-auto shrink-0 mt-1" />}
        </button>
      ))}
    </div>
  );
}

function StepBodyProfile({ value, onChange, fromProfile }: { value: BodyProfile; onChange: (v: BodyProfile) => void; fromProfile: boolean }) {
  const set = <K extends keyof BodyProfile>(k: K, v: BodyProfile[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Tu perfil físico</h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Para calcular tus necesidades calóricas precisas.</p>
      </div>
      {fromProfile && (
        <div className="flex items-center gap-2 px-3 py-2 bg-[var(--accent-subtle)] rounded-[var(--r-lg)] text-xs text-[var(--accent)]">
          <Info size={13} className="shrink-0" />
          Pre-rellenado desde tu perfil — puedes ajustar si ha cambiado algo
        </div>
      )}

      {/* Sex */}
      <div>
        <label className="text-xs text-[var(--text-tertiary)] mb-2 block">Sexo biológico</label>
        <div className="flex gap-2">
          {([['male','Hombre'],['female','Mujer'],['other','Otro']] as [Sex, string][]).map(([s, label]) => (
            <button key={s} onClick={() => set('sex', s)}
              className={`flex-1 py-2 rounded-[var(--r-md)] text-sm transition-all ${
                value.sex === s ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}>{label}</button>
          ))}
        </div>
      </div>

      {/* Age / Height / Weight */}
      {([
        ['age',      'Edad',     14, 99,  'años',  1],
        ['heightCm', 'Altura',   140,220, 'cm',    1],
        ['weightKg', 'Peso',     30, 250, 'kg',    0.5],
      ] as [keyof BodyProfile, string, number, number, string, number][]).map(([key, label, min, max, unit, step]) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-[var(--text-tertiary)]">{label}</label>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{value[key]} {unit}</span>
          </div>
          <input
            type="range" min={min} max={max} step={step}
            value={value[key] as number}
            onChange={e => set(key, parseFloat(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <div className="flex justify-between text-[9px] text-[var(--text-tertiary)] mt-0.5">
            <span>{min} {unit}</span><span>{max} {unit}</span>
          </div>
        </div>
      ))}

      {/* Activity */}
      <div>
        <label className="text-xs text-[var(--text-tertiary)] mb-2 block">Nivel de actividad actual</label>
        <div className="space-y-1.5">
          {ACTIVITIES.map(a => (
            <button key={a} onClick={() => set('activityLevel', a)}
              className={`w-full text-left px-3 py-2 rounded-[var(--r-md)] text-xs transition-all ${
                value.activityLevel === a
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}>{ACTIVITY_LABELS[a]}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepTimeBudget({ value, onChange }: { value: TimeBudget; onChange: (v: TimeBudget) => void }) {
  const set = <K extends keyof TimeBudget>(k: K, v: number) => onChange({ ...value, [k]: v });
  return (
    <div className="space-y-5">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Tu tiempo disponible</h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Sé realista — mejor empezar conservador.</p>
      </div>

      {([
        ['workoutDaysPerWeek',       'Días de entreno por semana', 1, 7,  1, 'días'],
        ['workoutMinutesPerSession', 'Minutos por sesión',         20,120,5, 'min'],
        ['habitMinutesPerDay',       'Minutos para hábitos al día',5, 60, 5, 'min'],
      ] as [keyof TimeBudget, string, number, number, number, string][]).map(([key, label, min, max, step, unit]) => (
        <div key={key}>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-[var(--text-primary)]">{label}</label>
            <span className="text-lg font-bold text-[var(--accent)]">{value[key]} <span className="text-xs font-normal text-[var(--text-tertiary)]">{unit}</span></span>
          </div>
          <input
            type="range" min={min} max={max} step={step}
            value={value[key]}
            onChange={e => set(key, parseInt(e.target.value))}
            className="w-full accent-[var(--accent)]"
          />
          <div className="flex justify-between text-[9px] text-[var(--text-tertiary)] mt-0.5">
            <span>{min} {unit}</span><span>{max} {unit}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepGoalPriorities({ value, onChange }: { value: PriorityArea[]; onChange: (v: PriorityArea[]) => void }) {
  const toggle = (area: PriorityArea) => {
    onChange(
      value.includes(area)
        ? value.filter(a => a !== area)
        : [...value, area]
    );
  };
  return (
    <div className="space-y-3">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">¿Qué quieres priorizar?</h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Selecciona las áreas más importantes para ti.</p>
      </div>
      {PRIORITY_AREAS.map(area => (
        <button key={area} onClick={() => toggle(area)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-[var(--r-xl)] border text-left transition-all ${
            value.includes(area)
              ? 'bg-[var(--accent)]/10 border-[var(--accent)]'
              : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-default)]'
          }`}
        >
          <span className="text-xl">{PRIORITY_EMOJIS[area]}</span>
          <span className="text-sm font-medium text-[var(--text-primary)]">{PRIORITY_LABELS[area]}</span>
          {value.includes(area) && <Check size={15} className="text-[var(--accent)] ml-auto" />}
        </button>
      ))}
    </div>
  );
}

function StepRecommendations({ intent, body, time, priorities }: {
  intent: LifeIntent; body: BodyProfile; time: TimeBudget; priorities: PriorityArea[];
}) {
  const derived = inferGoalTargets(intent, body, time, priorities);
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h2 className="text-lg font-semibold text-[var(--text-primary)]">Tus recomendaciones</h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">Calculadas a partir de tu perfil.</p>
      </div>

      {/* Calorie + macros */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-3">Nutrición objetivo</p>
        <p className="text-2xl font-bold text-[var(--text-primary)] mb-1">{derived.calorieTarget} <span className="text-sm font-normal text-[var(--text-tertiary)]">kcal/día</span></p>
        <div className="grid grid-cols-3 gap-2 mt-3">
          {[
            ['Proteína', derived.proteinG,  'var(--accent)'],
            ['Carbos',   derived.carbsG,    'var(--success)'],
            ['Grasa',    derived.fatG,       'var(--warning)'],
          ].map(([name, val, color]) => (
            <div key={name as string} className="text-center p-2 rounded-[var(--r-lg)] bg-[var(--bg-base)]">
              <p className="text-base font-bold" style={{ color: color as string }}>{val as number}g</p>
              <p className="text-[9px] text-[var(--text-tertiary)]">{name as string}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Workout */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-2">Entrenamiento</p>
        <p className="text-sm font-medium text-[var(--text-primary)]">{derived.workoutType}</p>
        <p className="text-xs text-[var(--text-tertiary)] mt-1">{derived.workoutDaysPerWeek} días/semana · {time.workoutMinutesPerSession} min/sesión</p>
      </div>

      {/* Habits */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4">
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wide mb-2">Hábitos sugeridos</p>
        <div className="space-y-1.5">
          {derived.habitSuggestions.slice(0, 4).map((h, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-[var(--text-secondary)]">
              <span className="text-[var(--accent)] mt-0.5 shrink-0">✓</span>
              <span>{h}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepReview({ intent, body, time, priorities }: {
  intent: LifeIntent; body: BodyProfile; time: TimeBudget; priorities: PriorityArea[];
}) {
  const derived = inferGoalTargets(intent, body, time, priorities);
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <span className="text-4xl">{INTENT_EMOJIS[intent]}</span>
        <h2 className="text-lg font-semibold text-[var(--text-primary)] mt-2">Todo listo</h2>
        <p className="text-sm text-[var(--text-tertiary)] mt-1">{derived.weeklyGoalSummary}</p>
      </div>

      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4 space-y-2.5">
        {[
          ['Objetivo',    INTENT_LABELS[intent]],
          ['Calorías',    `${derived.calorieTarget} kcal/día`],
          ['Proteína',    `${derived.proteinG}g/día`],
          ['Entrenos',    `${derived.workoutDaysPerWeek}×/semana`],
          ['Estilo',      derived.workoutType],
          ['Altura',      `${body.heightCm} cm`],
          ['Peso',        `${body.weightKg} kg`],
        ].map(([label, val]) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-xs text-[var(--text-tertiary)]">{label}</span>
            <span className="text-xs font-semibold text-[var(--text-primary)]">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export default function GoalWizardView() {
  const navigate  = useNavigate();
  const { toast } = useToast();
  const saveGoal  = useGoalsStore(s => s.saveGoal);
  const userProfile = useUserStore(s => s.profile);
  const userGetAge  = useUserStore(s => s.getAge);

  // Pre-fill body from userStore — avoids re-asking data the user already entered
  const profileAge = userGetAge();
  const profileHasBody = !!(userProfile?.heightCm && userProfile?.weightKg);

  const [step,       setStep]       = useState(0);
  const [saving,     setSaving]     = useState(false);
  const [intent,     setIntent]     = useState<LifeIntent | null>(null);
  const [body,       setBody]       = useState<BodyProfile>({
    age:           profileAge ?? 30,
    sex:           (userProfile?.sex === 'male' || userProfile?.sex === 'female' || userProfile?.sex === 'other')
                     ? userProfile.sex
                     : 'male',
    heightCm:      userProfile?.heightCm ?? 175,
    weightKg:      userProfile?.weightKg ?? 75,
    activityLevel: userProfile?.activityLevel ?? 'moderate',
  });
  const [time,       setTime]       = useState<TimeBudget>({
    workoutDaysPerWeek: 3, workoutMinutesPerSession: 60, habitMinutesPerDay: 20,
  });
  const [priorities, setPriorities] = useState<PriorityArea[]>(['fitness', 'nutrition']);

  const canNext = () => {
    if (step === 0) return intent !== null;
    if (step === 3) return priorities.length > 0;
    return true;
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      // Save
      if (!intent) return;
      setSaving(true);
      try {
        await saveGoal(intent, body, time, priorities);
        toast('¡Objetivo guardado! La app ajustará tus sugerencias.', 'success');
        navigate('/goals');
      } finally {
        setSaving(false);
      }
    }
  };

  const slideVariants = {
    enter:  { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0 },
    exit:   { opacity: 0, x: -30 },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-[var(--bg-hover)]">
        <motion.div
          className="h-full bg-[var(--accent)]"
          animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)]">
        <button
          onClick={() => step === 0 ? navigate('/goals') : setStep(s => s - 1)}
          aria-label="Paso anterior"
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] transition-colors"
        >
          <ChevronLeft size={18} className="text-[var(--text-secondary)]" />
        </button>
        <p className="text-xs text-[var(--text-tertiary)]">
          {step + 1} / {STEPS.length} · <span className="font-medium text-[var(--text-primary)]">{STEPS[step]}</span>
        </p>
        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-5 max-w-lg mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
          >
            {step === 0 && <StepLifeIntent value={intent} onChange={setIntent} />}
            {step === 1 && <StepBodyProfile value={body} onChange={setBody} fromProfile={profileHasBody} />}
            {step === 2 && <StepTimeBudget value={time} onChange={setTime} />}
            {step === 3 && <StepGoalPriorities value={priorities} onChange={setPriorities} />}
            {step === 4 && intent && <StepRecommendations intent={intent} body={body} time={time} priorities={priorities} />}
            {step === 5 && intent && <StepReview intent={intent} body={body} time={time} priorities={priorities} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* CTA */}
      <div className="px-4 pb-6 pt-3 border-t border-[var(--border-subtle)] bg-[var(--bg-base)]">
        <Button
          variant="primary"
          onClick={handleNext}
          disabled={!canNext() || saving}
          loading={saving}
          icon={step < STEPS.length - 1 ? <ChevronRight size={14} /> : <Check size={14} />}
          iconPosition="right"
          className="w-full"
        >
          {step < STEPS.length - 1 ? 'Continuar' : 'Guardar mi objetivo'}
        </Button>
      </div>
    </div>
  );
}
