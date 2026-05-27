import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, AlertTriangle } from 'lucide-react';
import { Button } from '../../../../shared/components/ui';
import { overlayVariants, slideUpVariants } from '../../../../shared/animations';
import { useBadHabitsStore } from '../../store/badHabitsStore';
import { SobrietyTimer } from './SobrietyTimer';
import { CravingHelper } from './CravingHelper';
import type { BadHabit } from '../../types/badHabits';
import { fmt } from '../../../../shared/utils/fmt';

interface BadHabitDetailProps {
  habit:   BadHabit;
  isOpen:  boolean;
  onClose: () => void;
}

export function BadHabitDetail({ habit, isOpen, onClose }: BadHabitDetailProps) {
  const { getSavingsAmount, removeBadHabit } = useBadHabitsStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'craving' | 'milestones' | 'history'>('overview');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const savings       = getSavingsAmount(habit.id);
  const reachedCount  = habit.milestones.filter(m => m.reached).length;

  const tabs: { id: typeof activeTab; label: string }[] = [
    { id: 'overview',   label: 'Resumen' },
    { id: 'craving',    label: 'Antojo' },
    { id: 'milestones', label: `Hitos ${reachedCount}/${habit.milestones.length}` },
    { id: 'history',    label: 'Historial' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-x-0 bottom-0 z-[201] bg-[var(--bg-surface)] rounded-t-[var(--r-2xl)] flex flex-col"
            style={{
              maxHeight: '92dvh',
              paddingBottom: 'env(safe-area-inset-bottom, 16px)',
            }}
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 pt-4 pb-3 shrink-0">
              <div className="w-9 h-1 bg-[var(--border-strong)] rounded-full absolute top-3 left-1/2 -translate-x-1/2" />
              <span style={{ fontSize: 28 }}>{habit.emoji}</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold truncate">{habit.name}</h2>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {habit.relapses.length} recaída{habit.relapses.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] transition-colors touch-compact"
                style={{ minHeight: 'unset' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 px-5 border-b border-[var(--border-subtle)] shrink-0 overflow-x-auto">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className="px-3 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors touch-compact"
                  style={{
                    minHeight: 'unset',
                    color: activeTab === t.id ? 'var(--accent)' : 'var(--text-tertiary)',
                    borderBottom: `2px solid ${activeTab === t.id ? 'var(--accent)' : 'transparent'}`,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 py-5">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <SobrietyTimer startDate={habit.startDate} />
                  {savings > 0 && (
                    <div
                      className="flex items-center justify-center gap-2 p-3 rounded-[var(--r-lg)]"
                      style={{ background: 'var(--success-subtle)' }}
                    >
                      <span style={{ fontSize: 20 }}>💰</span>
                      <span className="font-semibold" style={{ color: 'var(--success)' }}>
                        Ahorrado: {fmt(savings, { decimals: 2 })} {habit.savings?.currency ?? '€'}
                      </span>
                    </div>
                  )}
                  {habit.description && (
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                      {habit.description}
                    </p>
                  )}
                  {habit.reason && (
                    <div className="p-3 rounded-[var(--r-lg)] bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                      <p className="text-xs font-semibold text-[var(--text-tertiary)] mb-1">Mi motivación</p>
                      <p className="text-sm text-[var(--text-primary)] italic">"{habit.reason}"</p>
                    </div>
                  )}

                  {/* Danger zone */}
                  <div className="pt-4 border-t border-[var(--border-subtle)]">
                    {!confirmDelete ? (
                      <button
                        onClick={() => setConfirmDelete(true)}
                        className="text-sm text-red-500 underline underline-offset-2"
                      >
                        Eliminar hábito
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-red-600">
                          <AlertTriangle size={14} />
                          <span className="text-sm font-medium">¿Eliminar todo el progreso?</span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="flex-1" onClick={() => setConfirmDelete(false)}>
                            Cancelar
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            className="flex-1"
                            onClick={() => { removeBadHabit(habit.id); onClose(); }}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'craving' && <CravingHelper habitName={habit.name} />}

              {activeTab === 'milestones' && (
                <div className="space-y-2">
                  {habit.milestones.map((m, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-[var(--r-lg)]"
                      style={{
                        background: m.reached ? 'var(--success-subtle)' : 'var(--bg-base)',
                        opacity: m.reached ? 1 : 0.6,
                      }}
                    >
                      <span style={{ fontSize: 22 }}>{m.reached ? m.emoji : '🔒'}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{m.label}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{m.days} días</p>
                      </div>
                      {m.reached && (
                        <Trophy size={14} className="text-[var(--success)]" />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  {habit.relapses.length === 0 ? (
                    <div className="text-center py-8">
                      <span style={{ fontSize: 36 }}>🎉</span>
                      <p className="text-sm font-medium mt-2">Sin recaídas registradas</p>
                      <p className="text-xs text-[var(--text-tertiary)] mt-1">¡Sigue así!</p>
                    </div>
                  ) : (
                    [...habit.relapses].reverse().map((r, i) => (
                      <div key={i} className="p-3 rounded-[var(--r-lg)] bg-[var(--bg-base)] border border-[var(--border-subtle)]">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-[var(--text-tertiary)]">
                            {new Date(r.date).toLocaleDateString('es-ES', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </p>
                          {r.trigger && (
                            <span
                              className="text-[10px] px-2 py-0.5 rounded-full"
                              style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
                            >
                              {r.trigger}
                            </span>
                          )}
                        </div>
                        {r.note && (
                          <p className="text-sm text-[var(--text-secondary)]">{r.note}</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
