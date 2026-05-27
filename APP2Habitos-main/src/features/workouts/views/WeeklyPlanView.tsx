import { useState, useMemo } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { Plus, Trash2, Dumbbell, Check, AlertCircle } from 'lucide-react';
import { useWorkoutsStore } from '../store/workoutsStore';
import { Button, EmptyState, Modal } from '../../../shared/components/ui';
import { fmt } from '../../../shared/utils/fmt';
import type { Workout, WorkoutTemplate, WeeklyPlan, DayPlan } from '../types';

const WEEK_DAYS_ORDERED = [1, 2, 3, 4, 5, 6, 0] as const; // Mon → Sun
const DAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DAY_FULL  = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

interface WeeklyPlanViewProps {
  onStartTemplate: (t: WorkoutTemplate) => void;
}

export function WeeklyPlanView({ onStartTemplate }: WeeklyPlanViewProps) {
  const store = useWorkoutsStore();
  const { weeklyPlans, activePlanId, setActivePlan, deleteWeeklyPlan, templates } = store;
  const [showCreate, setShowCreate] = useState(false);

  const activePlan = weeklyPlans.find(p => p.id === activePlanId) ?? null;

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday

  const weekWorkouts = useMemo(() => {
    const end = addDays(weekStart, 7);
    return store.workouts.filter(w => w.date >= format(weekStart, 'yyyy-MM-dd') && w.date < format(end, 'yyyy-MM-dd'));
  }, [store.workouts, weekStart]);

  return (
    <div className="mt-3 space-y-4">
      {weeklyPlans.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[9px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Mis planes</p>
          {weeklyPlans.map(plan => {
            const isActive = plan.id === activePlanId;
            const daysCount = plan.days.filter(d => d.templateId !== null).length;
            return (
              <div
                key={plan.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-[var(--r-lg)] border transition-all ${
                  isActive
                    ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)]'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{plan.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{daysCount} días de entreno</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => deleteWeeklyPlan(plan.id)}
                    className="w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                  <button
                    onClick={() => setActivePlan(isActive ? null : plan.id)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-[var(--r-md)] transition-colors ${
                      isActive
                        ? 'bg-[var(--accent)] text-white'
                        : 'bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }`}
                  >
                    {isActive ? '✓ Activo' : 'Activar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activePlan ? (
        <WeeklyGrid
          plan={activePlan}
          weekStart={weekStart}
          weekWorkouts={weekWorkouts}
          templates={templates}
          planId={activePlan.id}
          onStartTemplate={onStartTemplate}
        />
      ) : (
        <EmptyState
          icon={<Dumbbell size={24} />}
          title="Sin plan semanal activo"
          description="Crea un plan para organizar tus entrenamientos por semana y ver el progreso aquí."
          action={{ label: 'Crear mi primer plan', onClick: () => setShowCreate(true) }}
          className="mt-2"
        />
      )}

      <Button
        variant="secondary"
        size="sm"
        icon={<Plus size={14} />}
        onClick={() => setShowCreate(true)}
        className={activePlan ? '' : 'hidden'}
      >
        Nuevo plan
      </Button>

      <CreatePlanModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        templates={templates}
        onCreate={async (name, days) => {
          const plan = await store.createWeeklyPlan({ name, days });
          await store.setActivePlan(plan.id);
          setShowCreate(false);
        }}
      />
    </div>
  );
}

// ── Weekly grid ───────────────────────────────────────────────────────────────

interface WeeklyGridProps {
  plan: WeeklyPlan;
  weekStart: Date;
  weekWorkouts: Workout[];
  templates: WorkoutTemplate[];
  planId: string;
  onStartTemplate: (t: WorkoutTemplate) => void;
}

function WeeklyGrid({ plan, weekStart, weekWorkouts, templates, onStartTemplate }: WeeklyGridProps) {
  const store = useWorkoutsStore();
  const [assigningDow, setAssigningDow] = useState<number | null>(null);
  const todayStr = format(new Date(), 'yyyy-MM-dd');

  // Summary stats
  const plannedCount = plan.days.filter(d => d.templateId !== null).length;
  const completedCount = weekWorkouts.length;
  const totalVolume = weekWorkouts.reduce((s, w) => s + w.totalVolume, 0);
  const adherence = plannedCount > 0 ? (completedCount / plannedCount) * 100 : 0;

  return (
    <div className="space-y-3">
      {/* Week summary */}
      <div className="grid grid-cols-3 gap-2">
        {[
          {
            label: 'Completados',
            value: `${completedCount}/${plannedCount}`,
            color: completedCount >= plannedCount && plannedCount > 0 ? 'var(--success)' : 'var(--accent)',
          },
          {
            label: 'Adherencia',
            value: `${fmt(adherence, { decimals: 0 })}%`,
            color: adherence >= 80 ? 'var(--success)' : adherence >= 50 ? 'var(--warning)' : adherence > 0 ? 'var(--danger)' : 'var(--text-tertiary)',
          },
          {
            label: 'Volumen',
            value: totalVolume >= 1000 ? `${fmt(totalVolume / 1000, { decimals: 1 })}t` : `${fmt(totalVolume, { integer: true })}kg`,
            color: 'var(--text-primary)',
          },
        ].map(s => (
          <div key={s.label} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] px-3 py-2.5 text-center">
            <p className="text-lg font-bold leading-none" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] text-[var(--text-tertiary)] mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Day cards */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] divide-y divide-[var(--border-subtle)] overflow-hidden">
        {WEEK_DAYS_ORDERED.map((dow, idx) => {
          const dayDate = addDays(weekStart, idx);
          const dateStr = format(dayDate, 'yyyy-MM-dd');
          const isToday = dateStr === todayStr;
          const isPast = dateStr < todayStr;
          const dayPlan = plan.days.find(d => d.dayOfWeek === dow);
          const template = dayPlan?.templateId ? templates.find(t => t.id === dayPlan.templateId) ?? null : null;
          const completed = weekWorkouts.find(w => w.date === dateStr) ?? null;

          return (
            <DayCard
              key={dow}
              idx={idx}
              dayDate={dayDate}
              isToday={isToday}
              isPast={isPast}
              template={template}
              completed={completed}
              onAssign={() => setAssigningDow(dow)}
              onStart={() => template && onStartTemplate(template)}
            />
          );
        })}
      </div>

      <AssignTemplateModal
        open={assigningDow !== null}
        dayLabel={assigningDow !== null ? DAY_FULL[WEEK_DAYS_ORDERED.indexOf(assigningDow as typeof WEEK_DAYS_ORDERED[number])] : ''}
        templates={templates}
        currentTemplateId={plan.days.find(d => d.dayOfWeek === assigningDow)?.templateId ?? null}
        onAssign={async (templateId) => {
          if (assigningDow !== null) await store.updateDayPlan(plan.id, assigningDow, { templateId });
          setAssigningDow(null);
        }}
        onClose={() => setAssigningDow(null)}
      />
    </div>
  );
}

// ── Day card ──────────────────────────────────────────────────────────────────

function DayCard({
  idx, dayDate, isToday, isPast, template, completed, onAssign, onStart,
}: {
  idx: number;
  dayDate: Date;
  isToday: boolean;
  isPast: boolean;
  template: WorkoutTemplate | null;
  completed: Workout | null;
  onAssign: () => void;
  onStart: () => void;
}) {
  const status =
    completed           ? 'completed' :
    isToday && template ? 'today' :
    isPast && template  ? 'missed' :
    template            ? 'planned' :
    'rest';

  const statusColor = {
    completed: 'var(--success)',
    today:     'var(--accent)',
    missed:    'var(--danger)',
    planned:   'var(--text-primary)',
    rest:      'var(--text-tertiary)',
  }[status];

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${isToday ? 'bg-[var(--accent)]/4' : ''}`}>
      {/* Day + date */}
      <div className="w-10 shrink-0 text-center">
        <p className={`text-[10px] font-bold uppercase ${isToday ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`}>
          {DAY_SHORT[idx]}
        </p>
        <div className={`w-7 h-7 mx-auto mt-0.5 rounded-full flex items-center justify-center text-sm font-medium ${
          isToday ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)]'
        }`}>
          {format(dayDate, 'd')}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {status === 'completed' && completed && (
          <>
            <div className="flex items-center gap-1.5">
              <Check size={12} style={{ color: 'var(--success)' }} />
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{completed.name}</p>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {completed.exercises.length} ejercicios
              {completed.totalVolume > 0 ? ` · ${fmt(completed.totalVolume, { integer: true })} kg` : ''}
              {completed.durationMinutes ? ` · ${completed.durationMinutes} min` : ''}
            </p>
          </>
        )}
        {status === 'missed' && template && (
          <>
            <div className="flex items-center gap-1.5">
              <AlertCircle size={12} style={{ color: 'var(--danger)' }} />
              <p className="text-sm font-medium truncate" style={{ color: 'var(--danger)' }}>{template.name}</p>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)]">No completado</p>
          </>
        )}
        {(status === 'today' || status === 'planned') && template && (
          <>
            <p className="text-sm font-medium truncate" style={{ color: statusColor }}>{template.name}</p>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {template.exercises.length} ejercicios · ~{template.estimatedMinutes} min
            </p>
          </>
        )}
        {status === 'rest' && (
          <p className="text-sm text-[var(--text-tertiary)]">Descanso</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        {isToday && template && !completed && (
          <button
            onClick={onStart}
            className="px-3 py-1.5 bg-[var(--accent)] text-white text-xs font-semibold rounded-[var(--r-md)] hover:opacity-90 transition-opacity"
          >
            Empezar
          </button>
        )}
        {status !== 'completed' && (
          <button
            onClick={onAssign}
            className="px-2.5 py-1.5 bg-[var(--bg-base)] text-[var(--text-tertiary)] text-xs rounded-[var(--r-md)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            {template ? '···' : '+'}
          </button>
        )}
      </div>
    </div>
  );
}

// ── Assign template modal ─────────────────────────────────────────────────────

function AssignTemplateModal({
  open, dayLabel, templates, currentTemplateId, onAssign, onClose,
}: {
  open: boolean;
  dayLabel: string;
  templates: WorkoutTemplate[];
  currentTemplateId: string | null;
  onAssign: (templateId: string | null) => void;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title={`Plantilla para ${dayLabel}`}>
      <div className="space-y-1.5">
        <button
          onClick={() => onAssign(null)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-lg)] border transition-colors text-left ${
            !currentTemplateId ? 'border-[var(--accent)] bg-[var(--accent)]/8' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <span className="text-sm text-[var(--text-secondary)] flex-1">Descanso / Sin asignar</span>
          {!currentTemplateId && <span className="text-[10px] text-[var(--accent)] font-bold">✓</span>}
        </button>
        {templates.map(t => (
          <button
            key={t.id}
            onClick={() => onAssign(t.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-lg)] border transition-colors text-left ${
              currentTemplateId === t.id ? 'border-[var(--accent)] bg-[var(--accent)]/8' : 'border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <Dumbbell size={14} className="text-[var(--text-tertiary)] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{t.name}</p>
              <p className="text-xs text-[var(--text-tertiary)]">~{t.estimatedMinutes} min · {t.exercises.length} ejercicios</p>
            </div>
            {currentTemplateId === t.id && <span className="text-[10px] text-[var(--accent)] font-bold shrink-0">✓</span>}
          </button>
        ))}
      </div>
    </Modal>
  );
}

// ── Create plan modal ─────────────────────────────────────────────────────────

function CreatePlanModal({
  open, onClose, templates, onCreate,
}: {
  open: boolean;
  onClose: () => void;
  templates: WorkoutTemplate[];
  onCreate: (name: string, days: DayPlan[]) => void;
}) {
  const [name, setName] = useState('');
  const [assignments, setAssignments] = useState<Record<number, string | null>>({
    1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 0: null,
  });

  const handleCreate = () => {
    if (!name.trim()) return;
    const days: DayPlan[] = WEEK_DAYS_ORDERED.map(dow => ({
      dayOfWeek: dow,
      templateId: assignments[dow] ?? null,
    }));
    onCreate(name.trim(), days);
    setName('');
    setAssignments({ 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 0: null });
  };

  return (
    <Modal open={open} onClose={onClose} title="Nuevo plan semanal">
      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-[var(--text-secondary)]">Nombre del plan</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ej: PPL 5 días, Push/Pull/Legs..."
            autoFocus
            className="w-full h-9 px-3 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
          />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-medium text-[var(--text-secondary)]">Asigna plantillas a cada día</p>
          {WEEK_DAYS_ORDERED.map((dow, idx) => (
            <div key={dow} className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-tertiary)] w-16 shrink-0">{DAY_FULL[idx]}</span>
              <select
                value={assignments[dow] ?? ''}
                onChange={e => setAssignments(a => ({ ...a, [dow]: e.target.value || null }))}
                className="flex-1 h-8 px-2 text-sm bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none"
              >
                <option value="">Descanso</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <Button variant="primary" size="md" className="w-full" onClick={handleCreate} disabled={!name.trim()}>
          Crear plan
        </Button>
      </div>
    </Modal>
  );
}
