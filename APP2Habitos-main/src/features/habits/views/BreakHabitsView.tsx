import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { Button } from '../../../shared/components/ui';
import { AnimatedPage } from '../../../shared/components/layout/AnimatedPage';
import { listContainerVariants, listItemVariants, slideUpVariants, overlayVariants } from '../../../shared/animations';
import { useBadHabitsStore } from '../store/badHabitsStore';
import { BAD_HABIT_PRESETS } from '../data/badHabitsPresets';
import { DEFAULT_MILESTONES } from '../types/badHabits';
import { BadHabitCard } from '../components/BreakHabits/BadHabitCard';
import type { BadHabitCategory } from '../types/badHabits';
import type { BadHabitPreset } from '../data/badHabitsPresets';

const CATEGORY_LABELS: Record<BadHabitCategory, string> = {
  substance: '💊 Sustancias',
  digital:   '📱 Digital',
  food:      '🍔 Alimentación',
  behavior:  '🧠 Comportamiento',
  sleep:     '🌙 Sueño',
  other:     '⚙️ Otro',
};

// ── Add sheet ────────────────────────────────────────────────────────────────

interface AddSheetProps {
  isOpen:  boolean;
  onClose: () => void;
}

function AddBadHabitSheet({ isOpen, onClose }: AddSheetProps) {
  const { addBadHabit } = useBadHabitsStore();
  const [step, setStep]     = useState<'pick' | 'custom'>('pick');
  const [name, setName]     = useState('');
  const [emoji, setEmoji]   = useState('🚫');
  const [reason, setReason] = useState('');
  const [costPerUnit, setCostPerUnit] = useState('');
  const [unitsPerDay, setUnitsPerDay] = useState('');

  const handlePreset = (preset: BadHabitPreset) => {
    addBadHabit({
      name:        preset.name,
      emoji:       preset.emoji,
      category:    preset.category,
      description: preset.description,
      startDate:   new Date().toISOString(),
      isActive:    true,
      isPaused:    false,
      relapses:    [],
      reason:      '',
      savings:     preset.hasSavings
        ? { costPerUnit: preset.defaultCostPerUnit ?? null, unitsPerDay: preset.defaultUnitsPerDay ?? null, currency: '€' }
        : null,
      milestones:  DEFAULT_MILESTONES.map(m => ({ ...m })),
    });
    onClose();
  };

  const handleCustom = () => {
    if (!name.trim()) return;
    addBadHabit({
      name:       name.trim(),
      emoji,
      category:   'other',
      startDate:  new Date().toISOString(),
      isActive:   true,
      isPaused:   false,
      relapses:   [],
      reason:     reason.trim() || undefined,
      savings:    costPerUnit && unitsPerDay
        ? { costPerUnit: Number(costPerUnit), unitsPerDay: Number(unitsPerDay), currency: '€' }
        : null,
      milestones: DEFAULT_MILESTONES.map(m => ({ ...m })),
    });
    onClose();
    setName(''); setEmoji('🚫'); setReason(''); setCostPerUnit(''); setUnitsPerDay('');
  };

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
            className="fixed inset-x-0 bottom-0 z-[201] bg-[var(--bg-surface)] rounded-t-[var(--r-2xl)] overflow-y-auto"
            style={{
              maxHeight: '90dvh',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
            }}
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Handle */}
            <div className="w-9 h-1 bg-[var(--border-strong)] rounded-full mx-auto mt-3" />

            <div className="flex items-center justify-between px-5 py-3">
              <h2 className="text-lg font-bold">Añadir hábito a romper</h2>
              <button
                onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)] touch-compact"
                style={{ minHeight: 'unset' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Tabs pick/custom */}
            <div className="flex gap-2 px-5 mb-4">
              {(['pick', 'custom'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStep(s)}
                  className="flex-1 py-2 rounded-[var(--r-lg)] text-sm font-semibold transition-colors"
                  style={{
                    background: step === s ? 'var(--accent)' : 'var(--bg-base)',
                    color: step === s ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {s === 'pick' ? 'Elegir preset' : 'Personalizado'}
                </button>
              ))}
            </div>

            {step === 'pick' && (
              <div className="px-5 space-y-2 pb-2">
                {BAD_HABIT_PRESETS.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => handlePreset(preset)}
                    className="w-full flex items-center gap-3 p-3 rounded-[var(--r-xl)] bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] transition-colors text-left"
                  >
                    <span style={{ fontSize: 22 }}>{preset.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)]">{preset.name}</p>
                      <p className="text-xs text-[var(--text-tertiary)] truncate">{preset.description}</p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--text-tertiary)] shrink-0">
                      {CATEGORY_LABELS[preset.category].split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {step === 'custom' && (
              <div className="px-5 space-y-4 pb-2">
                <div className="flex gap-3">
                  <div className="space-y-1">
                    <label className="label-caps text-[var(--text-tertiary)]">Emoji</label>
                    <input
                      type="text"
                      value={emoji}
                      onChange={e => setEmoji(e.target.value.slice(0, 2))}
                      className="w-14 h-12 text-center text-xl rounded-[var(--r-lg)] bg-[var(--bg-base)] border border-[var(--border-default)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="label-caps text-[var(--text-tertiary)]">Nombre</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Ej: Fumar, Scrolling..."
                      className="w-full h-12 px-4 rounded-[var(--r-lg)] bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="label-caps text-[var(--text-tertiary)]">Mi motivación (opcional)</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    placeholder="¿Por qué quiero dejarlo?"
                    className="w-full h-12 px-4 rounded-[var(--r-lg)] bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors"
                  />
                </div>

                <div>
                  <label className="label-caps text-[var(--text-tertiary)] block mb-2">Coste económico (opcional)</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--text-tertiary)]">€ por unidad</label>
                      <input
                        type="number"
                        value={costPerUnit}
                        onChange={e => setCostPerUnit(e.target.value)}
                        placeholder="0.00"
                        min={0} step={0.01}
                        className="w-full h-10 px-3 rounded-[var(--r-lg)] bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-center transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--text-tertiary)]">Unidades/día</label>
                      <input
                        type="number"
                        value={unitsPerDay}
                        onChange={e => setUnitsPerDay(e.target.value)}
                        placeholder="1"
                        min={0} step={0.5}
                        className="w-full h-10 px-3 rounded-[var(--r-lg)] bg-[var(--bg-base)] border border-[var(--border-default)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] text-center transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  variant="gradient"
                  size="lg"
                  className="w-full"
                  onClick={handleCustom}
                >
                  Empezar a contar
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export function BreakHabitsView() {
  const { badHabits } = useBadHabitsStore();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <AnimatedPage>
      <div className="space-y-4">
        {/* Sub-header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">
              {badHabits.length} hábito{badHabits.length !== 1 ? 's' : ''} monitoreado{badHabits.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={() => setShowAdd(true)}
          >
            Añadir
          </Button>
        </div>

        {badHabits.length === 0 ? (
          // Empty state
          <div className="text-center py-12 space-y-4">
            <span style={{ fontSize: 56 }}>🏆</span>
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                Sin hábitos a romper
              </h3>
              <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed max-w-xs mx-auto">
                Añade un hábito negativo que quieras superar. Llevaremos la cuenta por ti.
              </p>
            </div>
            <Button variant="gradient" size="lg" icon={<Plus size={16} />} onClick={() => setShowAdd(true)}>
              Añadir mi primer reto
            </Button>

            {/* Sugerencias rápidas */}
            <div className="pt-4">
              <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
                Hábitos frecuentes
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {BAD_HABIT_PRESETS.slice(0, 4).map(p => (
                  <span
                    key={p.id}
                    className="px-3 py-1.5 rounded-full text-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                  >
                    {p.emoji} {p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            variants={listContainerVariants}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            <AnimatePresence mode="popLayout">
              {badHabits.map(habit => (
                <motion.div key={habit.id} variants={listItemVariants} layout>
                  <BadHabitCard habit={habit} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      <AddBadHabitSheet isOpen={showAdd} onClose={() => setShowAdd(false)} />
    </AnimatedPage>
  );
}
