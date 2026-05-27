import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown, ChevronUp, X, Timer, Check, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useWorkoutsStore } from '../store/workoutsStore';
import { EXERCISE_MAP } from '../data/exercises';
import { SetRow } from '../components/SetRow';
import { ExerciseSearch } from '../components/ExerciseSearch';
import { InlineRestTimer } from '../components/RestTimer';
import { useRestTimer } from '../hooks/useRestTimer';
import { Button, Modal } from '../../../shared/components/ui';
import { useToast } from '../../../shared/components/ui';
import { calcTotalVolume } from '../types';
import { fmt } from '../../../shared/utils/fmt';

export default function ActiveWorkoutView() {
  const navigate = useNavigate();
  const {
    activeWorkout, exercises,
    addExerciseToActive, removeExerciseFromActive,
    addSetToExercise, updateSet, removeSet,
    finishWorkout, discardWorkout,
    getLastSetForExercise, saveAsTemplate,
  } = useWorkoutsStore();
  const { toast } = useToast();

  const [showExerciseSearch, setShowExerciseSearch] = useState(false);
  const [showFinishModal, setShowFinishModal]       = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [savedAsTemplate, setSavedAsTemplate]       = useState(false);
  const [collapsedExercises, setCollapsedExercises] = useState<Set<string>>(new Set());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const restTimer = useRestTimer(90);

  // Live workout timer
  useEffect(() => {
    if (!activeWorkout) return;
    const start = new Date(activeWorkout.startedAt).getTime();
    const iv = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(iv);
  }, [activeWorkout?.startedAt]);

  if (!activeWorkout) {
    navigate('/workouts');
    return null;
  }

  const totalVolume = calcTotalVolume(activeWorkout.exercises);
  const completedSets = activeWorkout.exercises.flatMap(e => e.sets).filter(s => s.completed).length;
  const totalSets = activeWorkout.exercises.flatMap(e => e.sets).length;

  const formatElapsed = (s: number) =>
    `${Math.floor(s / 3600) > 0 ? `${Math.floor(s / 3600)}h ` : ''}${Math.floor((s % 3600) / 60)}min`;

  const toggleCollapse = (id: string) => {
    setCollapsedExercises(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleFinish = async () => {
    const finished = await finishWorkout();
    if (finished) navigate('/workouts');
  };

  const handleSaveAsTemplate = async () => {
    if (!activeWorkout || savedAsTemplate) return;
    await saveAsTemplate(activeWorkout);
    setSavedAsTemplate(true);
    toast('Plantilla guardada', 'success');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--bg-void)]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[var(--bg-surface)]/95 backdrop-blur-sm border-b border-[var(--border-subtle)]" style={{ paddingTop: 'var(--safe-top)' }}>
        <div className="flex items-center gap-3 px-4 py-3 max-w-2xl mx-auto">
          <button
            onClick={() => setShowDiscardConfirm(true)}
            className="w-8 h-8 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-semibold text-[var(--text-primary)] truncate">{activeWorkout.name}</h1>
            <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
              <span className="flex items-center gap-1"><Timer size={10} />{formatElapsed(elapsedSeconds)}</span>
              <span>{completedSets}/{totalSets} sets</span>
              <span>{fmt(totalVolume, { integer: true })}kg vol.</span>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowFinishModal(true)}>
            Terminar
          </Button>
        </div>

        {/* Rest timer inline */}
        {restTimer.running && (
          <div className="px-4 pb-3 max-w-2xl mx-auto">
            <InlineRestTimer
              seconds={restTimer.seconds}
              running={restTimer.running}
              progress={restTimer.progress}
              onStop={restTimer.stop}
            />
          </div>
        )}
      </div>

      {/* Exercise list */}
      <div className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full space-y-4">
        <AnimatePresence initial={false}>
          {activeWorkout.exercises.map(workoutEx => {
            const exercise = EXERCISE_MAP.get(workoutEx.exerciseId) ?? exercises.find(e => e.id === workoutEx.exerciseId);
            if (!exercise) return null;
            const lastSet = getLastSetForExercise(workoutEx.exerciseId);
            const collapsed = collapsedExercises.has(workoutEx.id);
            const doneCount = workoutEx.sets.filter(s => s.completed).length;

            return (
              <motion.div
                key={workoutEx.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] overflow-hidden"
              >
                {/* Exercise header */}
                <div className="flex items-center gap-2 px-4 py-3">
                  <button
                    className="flex-1 text-left"
                    onClick={() => toggleCollapse(workoutEx.id)}
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)]">{exercise.name}</p>
                      {doneCount > 0 && (
                        <span className="text-xs text-[var(--success)]">{doneCount}/{workoutEx.sets.length}</span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
                      {exercise.muscleGroups.slice(0, 2).map(m => m).join(' · ')}
                      {lastSet ? ` · Anterior: ${lastSet.weight}×${lastSet.reps}` : ''}
                    </p>
                  </button>
                  <button
                    onClick={() => toggleCollapse(workoutEx.id)}
                    className="w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)]"
                  >
                    {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </button>
                  <button
                    onClick={() => removeExerciseFromActive(workoutEx.id)}
                    className="w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors"
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Sets */}
                {!collapsed && (
                  <div className="px-3 pb-3 space-y-1">
                    {/* Column headers */}
                    <div className="flex items-center gap-2 px-1 mb-2">
                      <span className="w-7 text-[10px] text-[var(--text-tertiary)] text-center">Set</span>
                      <span className="w-16 text-[10px] text-[var(--text-tertiary)] text-center">Anterior</span>
                      <span className="flex-1 text-[10px] text-[var(--text-tertiary)] text-center">kg</span>
                      <span className="flex-1 text-[10px] text-[var(--text-tertiary)] text-center">reps</span>
                      <span className="w-8 text-[10px] text-[var(--text-tertiary)] text-center">✓</span>
                      <span className="w-7" />
                    </div>

                    {workoutEx.sets.map((s, idx) => (
                      <SetRow
                        key={s.id}
                        set={s}
                        index={idx}
                        previousWeight={lastSet?.weight}
                        previousReps={lastSet?.reps}
                        onChange={patch => updateSet(workoutEx.id, s.id, patch)}
                        onRemove={() => removeSet(workoutEx.id, s.id)}
                        onComplete={() => {
                          updateSet(workoutEx.id, s.id, { completed: !s.completed });
                          if (!s.completed && workoutEx.restSeconds) {
                            restTimer.start(workoutEx.restSeconds);
                          }
                        }}
                      />
                    ))}

                    <button
                      onClick={() => addSetToExercise(workoutEx.id)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--r-md)] transition-colors border border-dashed border-[var(--border-default)] mt-1"
                    >
                      <Plus size={12} /> Añadir set
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add exercise button */}
        <button
          onClick={() => setShowExerciseSearch(true)}
          className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-[var(--border-default)] rounded-[var(--r-xl)] text-sm text-[var(--text-secondary)] hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
        >
          <Plus size={18} />
          Añadir ejercicio
        </button>
      </div>

      {/* Exercise search modal */}
      <Modal open={showExerciseSearch} onClose={() => setShowExerciseSearch(false)} title="Añadir ejercicio" size="lg">
        <div className="-mx-5 -mt-5 -mb-5">
          <ExerciseSearch
            exercises={exercises}
            onSelect={ex => addExerciseToActive(ex.id)}
            onClose={() => setShowExerciseSearch(false)}
          />
        </div>
      </Modal>

      {/* Finish modal */}
      <Modal open={showFinishModal} onClose={() => setShowFinishModal(false)} title="Terminar entrenamiento">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[var(--bg-base)] rounded-[var(--r-lg)] p-3">
              <p className="text-lg font-bold text-[var(--text-primary)]">{formatElapsed(elapsedSeconds)}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Duración</p>
            </div>
            <div className="bg-[var(--bg-base)] rounded-[var(--r-lg)] p-3">
              <p className="text-lg font-bold text-[var(--text-primary)]">{completedSets}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Sets completados</p>
            </div>
            <div className="bg-[var(--bg-base)] rounded-[var(--r-lg)] p-3">
              <p className="text-lg font-bold text-[var(--text-primary)]">{fmt(totalVolume, { integer: true })}</p>
              <p className="text-xs text-[var(--text-tertiary)]">Volumen (kg)</p>
            </div>
          </div>
          <button
            onClick={handleSaveAsTemplate}
            disabled={savedAsTemplate}
            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-[var(--r-md)] transition-colors border border-dashed border-[var(--border-default)] disabled:opacity-50"
          >
            <Bookmark size={12} />
            {savedAsTemplate ? 'Plantilla guardada ✓' : 'Guardar como plantilla'}
          </button>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setShowFinishModal(false)} className="flex-1">Volver</Button>
            <Button variant="primary" onClick={handleFinish} className="flex-1" icon={<Check size={14} />}>
              Guardar entreno
            </Button>
          </div>
        </div>
      </Modal>

      {/* Discard confirm */}
      <Modal open={showDiscardConfirm} onClose={() => setShowDiscardConfirm(false)} title="¿Descartar entrenamiento?">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            Se perderán todos los datos de esta sesión. Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowDiscardConfirm(false)} className="flex-1">Cancelar</Button>
            <Button variant="danger" onClick={() => { discardWorkout(); navigate('/workouts'); }} className="flex-1">
              Descartar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
