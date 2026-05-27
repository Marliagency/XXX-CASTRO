import { useState, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Plus, Dumbbell, BarChart2, ChevronRight, Trophy, Calculator, Scale, TrendingUp, AlertTriangle, Trash2, RotateCcw } from 'lucide-react';
import { WeeklyPlanView } from './WeeklyPlanView';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Button, EmptyState, Modal, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent,
} from '../../../shared/components/ui';
import { useWorkouts } from '../hooks/useWorkouts';
import { useWorkoutGoal } from '../hooks/useWorkoutGoal';
import { fmt } from '../../../shared/utils/fmt';
import { PlateCalculator } from '../components/PlateCalculator';
import { EXERCISE_MAP } from '../data/exercises';
import ActiveWorkoutView from './ActiveWorkoutView';
import { computeRecommendations, computeFatigueScore } from '../utils/progressiveOverload';
import {
  WorkoutsVolumeChart, WorkoutsFrequencyChart,
  MuscleDistributionChart, TopPRsChart, OneRMProgressionChart,
} from '../components/WorkoutsCharts';
import type { WorkoutTemplate } from '../types';

const ExerciseDetailView = lazy(() => import('./ExerciseDetailView'));
const BodyMetricsView    = lazy(() => import('./BodyMetricsView'));

// ── Router entry ─────────────────────────────────────────────────────────────
export default function WorkoutsView() {
  return (
    <Routes>
      <Route index element={<WorkoutsHome />} />
      <Route path="active" element={<ActiveWorkoutView />} />
      <Route path="exercise/:exerciseId" element={<Suspense fallback={<div className="p-4"><Skeleton className="h-64 w-full" /></div>}><ExerciseDetailView /></Suspense>} />
      <Route path="body" element={<Suspense fallback={<div className="p-4"><Skeleton className="h-64 w-full" /></div>}><BodyMetricsView /></Suspense>} />
    </Routes>
  );
}

// ── Main workouts page ────────────────────────────────────────────────────────
function WorkoutsHome() {
  const navigate  = useNavigate();
  const store     = useWorkouts();
  const [tab, setTab]                       = useState('history');
  const [showStart, setShowStart]           = useState(false);
  const [showPlateCalc, setShowPlateCalc]   = useState(false);
  const [startName, setStartName]           = useState('');

  const { workouts, loaded, activeWorkout, templates, deleteUserTemplate, repeatWorkout } = store;
  const { weeklyTarget, workoutType, hasGoal } = useWorkoutGoal();

  const recentWorkouts = [...workouts].reverse().slice(0, 20);
  const fatigueScore   = computeFatigueScore(workouts);
  const recommendations = computeRecommendations(workouts, EXERCISE_MAP as Map<string, { name: string }>);

  const handleStartEmpty = () => {
    if (!startName.trim()) return;
    store.startWorkout(startName.trim());
    setShowStart(false);
    navigate('active');
  };

  const handleStartTemplate = (t: WorkoutTemplate) => {
    store.startWorkout(t.name, t.id);
    navigate('active');
  };

  if (!loaded) {
    return (
      <div className="p-4 md:p-6 space-y-3">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Entrenamientos</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{workouts.length} sesiones</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" icon={<Scale size={14} />} onClick={() => navigate('body')} />
          <Button variant="ghost" size="sm" icon={<Calculator size={14} />} onClick={() => setShowPlateCalc(true)}>
            Discos
          </Button>
          {activeWorkout ? (
            <Button variant="accent" size="sm" onClick={() => navigate('active')}>
              Continuar entreno
            </Button>
          ) : (
            <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowStart(true)}>
              Nuevo
            </Button>
          )}
        </div>
      </div>

      {/* Active workout banner */}
      {activeWorkout && (
        <button
          onClick={() => navigate('active')}
          className="w-full flex items-center gap-3 px-4 py-3 bg-[var(--accent)] text-white rounded-[var(--r-lg)] hover:bg-[var(--accent-hover)] transition-colors"
        >
          <Dumbbell size={18} />
          <div className="flex-1 text-left">
            <p className="text-sm font-semibold">{activeWorkout.name} — en curso</p>
            <p className="text-xs opacity-80">{activeWorkout.exercises.length} ejercicios añadidos</p>
          </div>
          <ChevronRight size={16} />
        </button>
      )}

      {/* Fatigue banner */}
      {fatigueScore >= 70 && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-[var(--warning-subtle)] border border-[var(--warning)] rounded-[var(--r-lg)]">
          <AlertTriangle size={16} className="text-[var(--warning)] shrink-0" />
          <div>
            <p className="text-xs font-semibold text-[var(--text-primary)]">Fatiga elevada ({fatigueScore}/100)</p>
            <p className="text-[10px] text-[var(--text-secondary)]">Considera una semana de deload para recuperarte mejor.</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onChange={setTab}>
        <TabsList>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="plan">Plan</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="progress">Progresión</TabsTrigger>
        </TabsList>

        {/* ── History ─────────────────────────────────── */}
        <TabsContent value="history">
          {recentWorkouts.length === 0 ? (
            <EmptyState
              icon={<Dumbbell size={24} />}
              title="Sin entrenamientos aún"
              description="Registra tu primer entreno para ver el historial aquí."
              action={{ label: 'Empezar ahora', onClick: () => setShowStart(true) }}
              className="mt-4"
            />
          ) : (
            <div className="mt-3 space-y-2">
              {recentWorkouts.map(w => {
                const exerciseNames = w.exercises.slice(0, 3).map(e =>
                  EXERCISE_MAP.get(e.exerciseId)?.name ?? e.exerciseId
                );
                const hasPRs = w.prs.length > 0;
                return (
                  <div
                    key={w.id}
                    className="flex items-start gap-3 px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-lg)]"
                  >
                    <div className="w-10 h-10 rounded-[var(--r-lg)] bg-[var(--bg-base)] flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[var(--text-primary)] leading-none">
                        {format(parseISO(w.date), 'd')}
                      </span>
                      <span className="text-[9px] text-[var(--text-tertiary)] uppercase">
                        {format(parseISO(w.date), 'MMM', { locale: es })}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{w.name}</p>
                        {hasPRs && <Trophy size={12} className="text-[var(--warning)] shrink-0" />}
                      </div>
                      <p className="text-xs text-[var(--text-tertiary)] mt-0.5 truncate">
                        {exerciseNames.join(' · ')}{w.exercises.length > 3 ? ` +${w.exercises.length - 3}` : ''}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {w.durationMinutes && (
                          <span className="text-xs text-[var(--text-tertiary)]">{w.durationMinutes}min</span>
                        )}
                        {w.totalVolume > 0 && (
                          <span className="text-xs text-[var(--text-tertiary)]">{fmt(w.totalVolume, { integer: true })}kg vol.</span>
                        )}
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {w.exercises.reduce((s, e) => s + e.sets.filter(st => st.completed).length, 0)} sets
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => { repeatWorkout(w); navigate('active'); }}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-medium rounded-[var(--r-md)] hover:bg-[var(--accent)]/20 transition-colors shrink-0"
                      title="Repetir este entreno"
                    >
                      <RotateCcw size={11} />
                      Repetir
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Plan semanal ────────────────────────────── */}
        <TabsContent value="plan">
          <WeeklyPlanView onStartTemplate={handleStartTemplate} />
        </TabsContent>

        {/* ── Templates ───────────────────────────────── */}
        <TabsContent value="templates">
          <div className="mt-3 space-y-2">
            {templates.map(t => (
              <div
                key={t.id}
                className="flex items-start gap-3 px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-lg)]"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{t.name}</p>
                    {t.isCustom && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-[var(--accent)]/10 text-[var(--accent)]">Propia</span>
                    )}
                  </div>
                  {t.description && (
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{t.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-xs text-[var(--text-tertiary)]">~{t.estimatedMinutes}min</span>
                    <span className="text-xs text-[var(--text-tertiary)]">{t.exercises.length} ejercicios</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-[var(--bg-base)] rounded-[var(--r-sm)] text-[var(--text-secondary)] capitalize">
                      {t.difficulty === 'beginner' ? 'principiante' : t.difficulty === 'intermediate' ? 'intermedio' : 'avanzado'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {t.isCustom && (
                    <button
                      onClick={() => deleteUserTemplate(t.id)}
                      className="w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors rounded-[var(--r-md)]"
                      title="Eliminar plantilla"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                  <Button variant="secondary" size="sm" onClick={() => handleStartTemplate(t)}>
                    Empezar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* ── Stats ───────────────────────────────────── */}
        <TabsContent value="stats">
          {workouts.length === 0 ? (
            <EmptyState
              icon={<BarChart2 size={24} />}
              title="Sin datos aún"
              description="Registra entrenamientos para ver tus estadísticas."
              className="mt-4"
            />
          ) : (
            <div className="mt-3 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Total sesiones" value={String(workouts.length)} />
                <StatCard
                  label="Volumen total"
                  value={`${fmt(workouts.reduce((s, w) => s + w.totalVolume, 0) / 1000, { decimals: 1 })}t`}
                />
                <StatCard
                  label="PRs"
                  value={String(workouts.reduce((s, w) => s + w.prs.length, 0))}
                  icon={<Trophy size={12} />}
                />
              </div>
              {hasGoal && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-[var(--r-lg)] bg-[var(--accent)]/8 border border-[var(--accent)]/15 text-xs text-[var(--text-secondary)]">
                  <span className="shrink-0" style={{ color: 'var(--accent)' }}>🎯</span>
                  <span>Objetivo: <strong>{weeklyTarget} sesiones/semana</strong>{workoutType ? ` · ${workoutType}` : ''}</span>
                </div>
              )}
              <WorkoutsVolumeChart workouts={workouts} />
              <WorkoutsFrequencyChart workouts={workouts} weeklyTarget={weeklyTarget} />
              <MuscleDistributionChart workouts={workouts} />
              <TopPRsChart workouts={workouts} />
              <OneRMProgressionChart workouts={workouts} />
            </div>
          )}
        </TabsContent>

        {/* ── Progresión ──────────────────────────────── */}
        <TabsContent value="progress">
          {recommendations.length === 0 ? (
            <EmptyState
              icon={<TrendingUp size={24} />}
              title="Sin recomendaciones aún"
              description="Registra al menos 2 sesiones del mismo ejercicio para ver sugerencias de progresión."
              className="mt-4"
            />
          ) : (
            <div className="mt-3 space-y-2">
              {recommendations.slice(0, 8).map(rec => (
                <button
                  key={rec.exerciseId}
                  onClick={() => navigate(`exercise/${rec.exerciseId}`)}
                  className="w-full flex items-start gap-3 px-4 py-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] hover:bg-[var(--bg-hover)] transition-colors text-left"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${rec.confidence === 'high' ? 'bg-[var(--success)]' : rec.confidence === 'medium' ? 'bg-[var(--warning)]' : 'bg-[var(--danger)]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{rec.exerciseName}</p>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">Anterior: {rec.lastWeight}kg × {rec.lastReps}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{rec.note}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-[var(--accent)]">{rec.suggestedWeight}kg</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">× {rec.suggestedReps}</p>
                  </div>
                  <ChevronRight size={14} className="text-[var(--text-tertiary)] mt-0.5 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Start workout modal */}
      <Modal open={showStart} onClose={() => setShowStart(false)} title="Nuevo entrenamiento">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text-primary)]">Nombre del entrenamiento</label>
            <input
              type="text"
              value={startName}
              onChange={e => setStartName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleStartEmpty()}
              placeholder="Ej. Push día A, Piernas..."
              autoFocus
              className="w-full h-9 px-3 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>
          <Button variant="primary" size="md" className="w-full" onClick={handleStartEmpty} disabled={!startName.trim()}>
            Empezar en blanco
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border-subtle)]" /></div>
            <div className="relative text-center"><span className="px-2 text-xs text-[var(--text-tertiary)] bg-[var(--bg-surface)]">o elige una plantilla</span></div>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {templates.map(t => (
              <button
                key={t.id}
                onClick={() => { setShowStart(false); handleStartTemplate(t); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-lg)] bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] transition-colors text-left"
              >
                <Dumbbell size={16} className="text-[var(--text-tertiary)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{t.name}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">~{t.estimatedMinutes}min · {t.exercises.length} ejercicios</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Modal>

      {/* Plate calculator modal */}
      <Modal open={showPlateCalc} onClose={() => setShowPlateCalc(false)} title="Calculadora de discos">
        <PlateCalculator />
      </Modal>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg-base)] rounded-[var(--r-lg)] p-3 text-center">
      <div className="flex items-center justify-center gap-1 text-[var(--text-tertiary)] mb-1">
        {icon}
        <span className="text-[10px]">{label}</span>
      </div>
      <p className="text-xl font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
