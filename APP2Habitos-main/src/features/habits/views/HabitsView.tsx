import { useState } from 'react';
import { Plus, Archive, Settings2, Flame, BarChart2, Sparkles, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { format } from 'date-fns';
import {
  Button, EmptyState, Modal, Tabs, TabsList, TabsTrigger, TabsContent,
  Skeleton,
} from '../../../shared/components/ui';
import { useHabits } from '../hooks/useHabits';
import { useHabitsStore } from '../store/habitsStore';
import { useHabitGoalSync } from '../hooks/useHabitGoalSync';
import { HabitCard } from '../components/HabitCard';
import { HabitForm } from '../components/HabitForm';
import { HabitHeatmap } from '../components/HabitHeatmap';
import { HabitStatsDisplay } from '../components/HabitStats';
import { HABIT_PRESETS } from '../data/presets';
import {
  HabitsWeeklyChart, HabitsMonthlyChart,
  HabitBreakdownChart, HabitsWeekdayRadar,
} from '../components/HabitsCharts';
import { BreakHabitsView } from './BreakHabitsView';
import type { Habit, HabitEntry, HabitStats } from '../types';

export default function HabitsView() {
  const {
    habits, loaded,
    addHabit, updateHabit, archiveHabit,
    markComplete, decrementCount, markSkipped, unmark,
    getEntriesForHabit, getStatsForHabit, getEntryForDate,
  } = useHabits();
  const { entries: allEntries } = useHabitsStore();

  const [tab, setTab] = useState('all');
  const [showAdd, setShowAdd]         = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [editHabit, setEditHabit]     = useState<Habit | null>(null);
  const [detailHabit, setDetailHabit] = useState<Habit | null>(null);
  const [saving, setSaving]           = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState(false);

  const { hasSuggestions, suggestions } = useHabitGoalSync();

  const today = format(new Date(), 'yyyy-MM-dd');

  const { habits: allHabits } = useHabitsStore();
  const activeHabits   = habits.filter(h => !h.archivedAt);
  const archivedHabits = allHabits.filter(h =>  h.archivedAt);

  const handleAdd = async (data: Omit<Habit, 'id' | 'createdAt' | 'order'>) => {
    setSaving(true);
    await addHabit(data);
    setSaving(false);
    setShowAdd(false);
  };

  const handleEdit = async (data: Omit<Habit, 'id' | 'createdAt' | 'order'>) => {
    if (!editHabit) return;
    setSaving(true);
    await updateHabit(editHabit.id, data);
    setSaving(false);
    setEditHabit(null);
  };

  const handleAddPreset = async (preset: typeof HABIT_PRESETS[0]) => {
    await addHabit({ ...preset, archivedAt: null });
  };

  if (!loaded) {
    return (
      <div className="p-4 md:p-6 space-y-3">
        <Skeleton className="h-8 w-48" />
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Hábitos</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {activeHabits.length} activo{activeHabits.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowPresets(true)}>
            Plantillas
          </Button>
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
            Nuevo
          </Button>
        </div>
      </div>

      {/* Goal suggestion banner */}
      {hasSuggestions && !dismissedSuggestions && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-[var(--r-xl)] border border-[var(--accent)]/20 p-3"
          style={{ background: 'var(--accent)0d' }}
        >
          <button
            onClick={() => setDismissedSuggestions(true)}
            className="absolute top-2 right-2 p-1 rounded-full text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <X size={12} />
          </button>
          <div className="flex items-start gap-2 pr-5">
            <Sparkles size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--accent)' }} />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">
                Hábitos recomendados por tu objetivo
              </p>
              <div className="flex flex-wrap gap-1.5">
                {suggestions.slice(0, 5).map((s, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded-full border border-[var(--accent)]/30"
                    style={{ color: 'var(--accent)', background: 'var(--accent)15' }}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <button
                onClick={() => setShowPresets(true)}
                className="mt-2 text-[10px] font-medium underline underline-offset-2"
                style={{ color: 'var(--accent)' }}
              >
                Ver plantillas de hábitos →
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onChange={setTab}>
        <TabsList>
          <TabsTrigger value="all">Hábitos</TabsTrigger>
          <TabsTrigger value="break">Romper</TabsTrigger>
          <TabsTrigger value="week">Semana</TabsTrigger>
          <TabsTrigger value="month">Mes</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        {/* ── Tab: lista de hábitos ── */}
        <TabsContent value="all">
          {activeHabits.length === 0 ? (
            <EmptyState
              icon={<Flame size={24} />}
              title="Sin hábitos aún"
              description="Crea tu primer hábito o elige de las plantillas predefinidas."
              action={{ label: 'Ver plantillas', onClick: () => setShowPresets(true) }}
              className="mt-4"
            />
          ) : (
            <div className="mt-3 space-y-2">
              <AnimatePresence initial={false}>
                {activeHabits.map(habit => {
                  const entry = getEntryForDate(habit.id, today);
                  const stats = getStatsForHabit(habit.id);
                  return (
                    <HabitCard
                      key={habit.id}
                      habit={habit}
                      entry={entry}
                      stats={stats}
                      onComplete={() => markComplete(habit.id)}
                      onUnmark={() => unmark(habit.id, today)}
                      onSkip={() => markSkipped(habit.id, today)}
                      onIncrement={habit.type === 'count' ? () => markComplete(habit.id) : undefined}
                      onDecrement={habit.type === 'count' ? () => decrementCount(habit.id) : undefined}
                      onClick={() => setDetailHabit(habit)}
                    />
                  );
                })}
              </AnimatePresence>
              {archivedHabits.length > 0 && (
                <button
                  onClick={() => setTab('stats')}
                  className="w-full text-center py-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  {archivedHabits.length} archivado{archivedHabits.length > 1 ? 's' : ''} · Ver en Stats
                </button>
              )}
            </div>
          )}
        </TabsContent>

        {/* ── Tab: romper hábitos ── */}
        <TabsContent value="break">
          <div className="mt-3">
            <BreakHabitsView />
          </div>
        </TabsContent>

        {/* ── Tab: gráficos semanales ── */}
        <TabsContent value="week">
          {activeHabits.length === 0 ? (
            <EmptyState icon={<BarChart2 size={24} />} title="Sin hábitos" className="mt-4" />
          ) : (
            <div className="mt-3 space-y-4">
              <HabitsWeeklyChart habits={allHabits} entries={allEntries} />
            </div>
          )}
        </TabsContent>

        {/* ── Tab: gráficos mensuales ── */}
        <TabsContent value="month">
          {activeHabits.length === 0 ? (
            <EmptyState icon={<BarChart2 size={24} />} title="Sin hábitos" className="mt-4" />
          ) : (
            <div className="mt-3 space-y-4">
              <HabitsMonthlyChart habits={allHabits} entries={allEntries} />
              <HabitBreakdownChart habits={allHabits} entries={allEntries} />
            </div>
          )}
        </TabsContent>

        {/* ── Tab: estadísticas avanzadas ── */}
        <TabsContent value="stats">
          {activeHabits.length === 0 ? (
            <EmptyState icon={<BarChart2 size={24} />} title="Sin hábitos" className="mt-4" />
          ) : (
            <div className="mt-3 space-y-4">
              <HabitsWeekdayRadar habits={allHabits} entries={allEntries} />
              {archivedHabits.length > 0 && (
                <div className="section-group">
                  <p className="section-header">Archivados</p>
                  <div className="section-body">
                    {archivedHabits.map(habit => (
                      <div key={habit.id} className="section-row">
                        <span style={{ fontSize: 18 }}>{habit.emoji}</span>
                        <div className="section-row-content">
                          <div>
                            <span className="section-row-label" style={{ fontSize: 15, opacity: 0.6 }}>{habit.name}</span>
                          </div>
                          <Button variant="ghost" size="sm" onClick={() => updateHabit(habit.id, { archivedAt: null })}>
                            Restaurar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ── Modals ── */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Nuevo hábito">
        <HabitForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} loading={saving} />
      </Modal>

      <Modal open={!!editHabit} onClose={() => setEditHabit(null)} title="Editar hábito">
        {editHabit && (
          <HabitForm
            initialData={editHabit}
            onSubmit={handleEdit}
            onCancel={() => setEditHabit(null)}
            loading={saving}
          />
        )}
      </Modal>

      <Modal
        open={!!detailHabit}
        onClose={() => setDetailHabit(null)}
        title={detailHabit ? `${detailHabit.emoji} ${detailHabit.name}` : ''}
        size="lg"
      >
        {detailHabit && (
          <HabitDetail
            habit={detailHabit}
            entries={getEntriesForHabit(detailHabit.id)}
            stats={getStatsForHabit(detailHabit.id)}
            onEdit={() => { setEditHabit(detailHabit); setDetailHabit(null); }}
            onArchive={async () => { await archiveHabit(detailHabit.id); setDetailHabit(null); }}
          />
        )}
      </Modal>

      <Modal open={showPresets} onClose={() => setShowPresets(false)} title="Hábitos recomendados" size="lg">
        <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
          {HABIT_PRESETS.map((preset, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--r-lg)] bg-[var(--bg-base)] hover:bg-[var(--bg-hover)] transition-colors"
            >
              <span className="text-xl shrink-0">{preset.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)]">{preset.name}</p>
                {preset.description && (
                  <p className="text-xs text-[var(--text-tertiary)] truncate">{preset.description}</p>
                )}
              </div>
              <Button variant="secondary" size="sm" onClick={() => handleAddPreset(preset)}>
                Añadir
              </Button>
            </motion.div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

// ── Detail sub-component ──────────────────────────────────────────────────────

interface HabitDetailProps {
  habit: Habit;
  entries: HabitEntry[];
  stats: HabitStats | null;
  onEdit: () => void;
  onArchive: () => Promise<void>;
}

function HabitDetail({ habit, entries, stats, onEdit, onArchive }: HabitDetailProps) {
  return (
    <div className="space-y-5">
      {habit.identity && (
        <p
          className="text-sm text-[var(--text-secondary)] italic border-l-2 pl-3"
          style={{ borderColor: habit.color }}
        >
          "{habit.identity}"
        </p>
      )}

      {stats ? (
        <HabitStatsDisplay stats={stats} color={habit.color} />
      ) : (
        <p className="text-sm text-[var(--text-tertiary)]">Sin datos aún. ¡Empieza hoy!</p>
      )}

      <div>
        <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wide mb-2">
          Últimos 90 días
        </p>
        <HabitHeatmap
          entries={entries}
          color={habit.color}
          targetCount={habit.targetCount ?? 1}
        />
      </div>

      <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
        <Button variant="secondary" size="sm" icon={<Settings2 size={14} />} onClick={onEdit} className="flex-1">
          Editar
        </Button>
        <Button variant="ghost" size="sm" icon={<Archive size={14} />} onClick={onArchive} className="flex-1">
          Archivar
        </Button>
        <Button variant="ghost" size="sm" icon={<BarChart2 size={14} />} onClick={() => undefined} className="flex-1">
          Gráficos
        </Button>
      </div>
    </div>
  );
}
