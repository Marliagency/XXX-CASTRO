import { useEffect, useState, useMemo } from 'react';
import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { BookOpen, Plus, Search, Flame, TrendingUp, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine,
} from 'recharts';
import { useJournalStore } from '../store/journalStore';
import { EntryCard } from '../components/EntryCard';
import { EntryForm } from '../components/EntryForm';
import { MoodDot } from '../components/MoodPicker';
import { Modal, EmptyState, Skeleton, Tabs, TabsList, TabsTrigger, TabsContent } from '../../../shared/components/ui';
import { useToast } from '../../../shared/components/ui';
import { MOOD_LABELS, MOOD_EMOJI } from '../types';
import { fmt } from '../../../shared/utils/fmt';
import { CHART_THEME, AppleTooltip } from '../../../shared/utils/chartTheme';
import type { JournalEntry, Mood } from '../types';

const JOURNAL_COLOR = '#af52de';

// ─── Mini mood calendar ───────────────────────────────────────────────────────
function MoodCalendar({ calendar }: { calendar: { date: string; mood: Mood | null }[] }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {calendar.map(({ date, mood }) => (
        <div
          key={date}
          title={`${format(parseISO(date), 'd MMM', { locale: es })}${mood ? '' : ' — sin registro'}`}
          className="w-5 h-5 rounded-sm"
          style={{ backgroundColor: mood ? undefined : 'var(--bg-hover)' }}
        >
          {mood ? <MoodDot mood={mood} size={20} /> : null}
        </div>
      ))}
    </div>
  );
}

// ─── Mood trend chart (30 days area) ─────────────────────────────────────────
function MoodTrendChart({ entries }: { entries: JournalEntry[] }) {
  const data = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d    = subDays(new Date(), 29 - i);
      const date = format(d, 'yyyy-MM-dd');
      const label= format(d, 'd MMM', { locale: es });
      const entry = entries.find(e => e.date === date);
      return { label, date, mood: entry?.mood ?? null, energy: entry?.energy ?? null };
    }).filter(d => d.mood !== null || d.energy !== null);
  }, [entries]);

  if (data.length < 3) return null;

  const avg = data.filter(d => d.mood !== null).length > 0
    ? data.filter(d => d.mood !== null).reduce((s, d) => s + (d.mood ?? 0), 0) / data.filter(d => d.mood !== null).length
    : null;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Ánimo — últimos 30 días</span>
        {avg !== null && (
          <div className="flex items-center gap-1.5">
            <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: JOURNAL_COLOR }}>
              {fmt(avg, { decimals: 1 })}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>/5 media</span>
          </div>
        )}
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={JOURNAL_COLOR} stopOpacity={0.2} />
              <stop offset="95%" stopColor={JOURNAL_COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...CHART_THEME.grid} />
          <XAxis dataKey="label" {...CHART_THEME.axis} interval="preserveStartEnd" />
          <YAxis {...CHART_THEME.axis} domain={[1, 5]} tickCount={5} width={20}
            tickFormatter={v => String(v)} />
          <Tooltip content={<AppleTooltip unit="/5" decimals={0} />} />
          {avg !== null && (
            <ReferenceLine y={avg} stroke={JOURNAL_COLOR} strokeDasharray="4 3" strokeWidth={1}
              label={{ value: 'Media', position: 'insideTopRight', fontSize: 10, fill: JOURNAL_COLOR }} />
          )}
          <Area type="monotone" dataKey="mood" stroke={JOURNAL_COLOR} strokeWidth={2}
            fill="url(#moodGrad)" dot={{ fill: JOURNAL_COLOR, r: 3, strokeWidth: 0 }}
            connectNulls name="Ánimo" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Mood distribution bar ────────────────────────────────────────────────────
function MoodDistributionChart({ entries }: { entries: JournalEntry[] }) {
  const data = useMemo(() => {
    const counts = [1, 2, 3, 4, 5].map(score => ({
      label: `${MOOD_EMOJI[score]} ${MOOD_LABELS[score]}`,
      score,
      count: entries.filter(e => e.mood === score).length,
    }));
    const total = entries.filter(e => e.mood !== null).length;
    return counts.map(d => ({ ...d, pct: total > 0 ? Math.round((d.count / total) * 100) : 0 }));
  }, [entries]);

  if (data.every(d => d.count === 0)) return null;

  const COLORS: Record<number, string> = {
    1: '#ff3b30', 2: '#ff9500', 3: '#8e8e93', 4: '#34c759', 5: '#007aff',
  };

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Distribución de ánimo</span>
      </div>
      <div className="space-y-2.5 mt-1">
        {data.map(d => (
          <div key={d.score}>
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{d.label}</span>
              <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: COLORS[d.score] }}>
                {d.count} <span style={{ fontWeight: 400, color: 'var(--text-tertiary)', fontFamily: 'inherit' }}>({fmt(d.pct, { integer: true })}%)</span>
              </span>
            </div>
            <div style={{ height: 5, background: 'var(--bg-hover)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${d.pct}%`,
                background: COLORS[d.score], borderRadius: 3,
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tag frequency chart ──────────────────────────────────────────────────────
function TagFrequencyChart({ entries }: { entries: JournalEntry[] }) {
  const data = useMemo(() => {
    const counts: Record<string, number> = {};
    entries.forEach(e => e.tags.forEach(t => { counts[t] = (counts[t] ?? 0) + 1; }));
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([tag, count]) => ({ tag, count }));
  }, [entries]);

  if (data.length === 0) return null;

  const max = data[0].count;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Temas frecuentes</span>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <BarChart data={data} layout="vertical" barCategoryGap="20%">
          <CartesianGrid {...CHART_THEME.grid} />
          <XAxis type="number" {...CHART_THEME.axis} tickFormatter={v => fmt(v, { integer: true })} domain={[0, max + 1]} />
          <YAxis type="category" dataKey="tag" {...CHART_THEME.axis} width={80} />
          <Tooltip content={<AppleTooltip unit=" veces" decimals={0} />} />
          <Bar dataKey="count" fill={JOURNAL_COLOR} radius={[0, 4, 4, 0]} fillOpacity={0.85} name="Entradas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Energy vs Mood scatter-style chart ──────────────────────────────────────
function EnergyMoodChart({ entries }: { entries: JournalEntry[] }) {
  const data = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const date  = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd');
      const label = format(subDays(new Date(), 13 - i), 'EEE', { locale: es });
      const entry = entries.find(e => e.date === date);
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1, 3),
        mood: entry?.mood ?? null,
        energy: entry?.energy ?? null,
      };
    }).filter(d => d.mood !== null || d.energy !== null);
  }, [entries]);

  if (data.filter(d => d.energy !== null).length < 3) return null;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Ánimo vs Energía</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: JOURNAL_COLOR }} />
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Ánimo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff9500' }} />
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Energía</span>
          </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barCategoryGap="25%" barGap={3}>
          <CartesianGrid {...CHART_THEME.grid} />
          <XAxis dataKey="label" {...CHART_THEME.axis} />
          <YAxis {...CHART_THEME.axis} domain={[0, 5]} tickCount={6} width={20} />
          <Tooltip content={<AppleTooltip unit="/5" decimals={0} />} />
          <Bar dataKey="mood" fill={JOURNAL_COLOR} radius={[3, 3, 0, 0]} name="Ánimo" fillOpacity={0.9} />
          <Bar dataKey="energy" fill="#ff9500" radius={[3, 3, 0, 0]} name="Energía" fillOpacity={0.9} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Writing streak & words heatmap ──────────────────────────────────────────
function WritingStats({ entries, streak }: { entries: JournalEntry[]; streak: number }) {
  const avgWords = useMemo(() => {
    const withWords = entries.filter(e => e.wordCount > 0);
    return withWords.length > 0
      ? Math.round(withWords.reduce((s, e) => s + e.wordCount, 0) / withWords.length)
      : 0;
  }, [entries]);

  const thisMonth = useMemo(() => {
    const start = format(new Date(new Date().getFullYear(), new Date().getMonth(), 1), 'yyyy-MM-dd');
    return entries.filter(e => e.date >= start).length;
  }, [entries]);

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Racha actual', value: `${streak} días`, color: streak > 0 ? 'var(--warning)' : 'var(--text-primary)' },
        { label: 'Este mes', value: `${thisMonth} entradas`, color: JOURNAL_COLOR },
        { label: 'Palabras media', value: `${avgWords}`, color: 'var(--text-primary)' },
      ].map(s => (
        <div key={s.label} className="metric-card text-center">
          <p className="mono" style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main View ────────────────────────────────────────────────────────────────
export default function JournalView() {
  const {
    entries, loaded,
    loadFromStorage, addEntry, updateEntry, deleteEntry, pinEntry,
    getStreakDays, getAverageMood, getMoodCalendar,
  } = useJournalStore();
  const { toast } = useToast();

  const [tab, setTab]               = useState('entries');
  const [search, setSearch]         = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [saving, setSaving]         = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (!loaded) loadFromStorage();
  }, [loaded, loadFromStorage]);

  const streak       = useMemo(() => getStreakDays(), [entries]);
  const avgMood      = useMemo(() => getAverageMood(30), [entries]);
  const moodCalendar = useMemo(() => getMoodCalendar(28), [entries]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const sorted = [...entries].sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return b.date.localeCompare(a.date);
    });
    if (!q) return sorted;
    return sorted.filter(e =>
      e.content.toLowerCase().includes(q) ||
      e.title?.toLowerCase().includes(q) ||
      e.tags.some(t => t.includes(q))
    );
  }, [entries, search]);

  const openNew  = () => { setEditingEntry(null); setModalOpen(true); };
  const openEdit = (entry: JournalEntry) => { setEditingEntry(entry); setModalOpen(true); };

  const handleSave = async (data: Parameters<typeof addEntry>[0]) => {
    setSaving(true);
    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, data);
        toast('Entrada actualizada', 'success');
      } else {
        await addEntry(data);
        toast('Entrada guardada', 'success');
      }
      setModalOpen(false);
      setEditingEntry(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }
    await deleteEntry(id);
    setDeleteConfirm(null);
    toast('Entrada eliminada', 'info');
  };

  const handlePin = async (id: string, pinned: boolean) => {
    await pinEntry(id, pinned);
    toast(pinned ? 'Entrada fijada' : 'Entrada desfijada', 'info');
  };

  if (!loaded) {
    return (
      <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto pb-24 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[var(--text-primary)]">Diario</h1>
        <button
          onClick={openNew}
          aria-label="Nueva entrada"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent)] text-white rounded-[var(--r-lg)] text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus size={14} />
          Nueva
        </button>
      </div>

      {/* Stats strip */}
      {entries.length > 0 && (
        <div className="flex items-center gap-4 p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)]">
          <div className="flex items-center gap-1.5">
            <Flame size={14} className="text-[var(--warning)]" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">{streak}</span>
            <span className="text-xs text-[var(--text-tertiary)]">días</span>
          </div>
          <div className="w-px h-4 bg-[var(--border-subtle)]" />
          {avgMood !== null && (
            <>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} className="text-[var(--accent)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">{fmt(avgMood, { decimals: 1 })}</span>
                <span className="text-xs text-[var(--text-tertiary)]">ánimo 30d</span>
              </div>
              <div className="w-px h-4 bg-[var(--border-subtle)]" />
            </>
          )}
          <div className="flex items-center gap-1.5">
            <BookOpen size={14} className="text-[var(--text-tertiary)]" />
            <span className="text-xs font-semibold text-[var(--text-primary)]">{entries.length}</span>
            <span className="text-xs text-[var(--text-tertiary)]">entradas</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onChange={setTab}>
        <TabsList>
          <TabsTrigger value="entries">Entradas</TabsTrigger>
          <TabsTrigger value="trends">Tendencias</TabsTrigger>
        </TabsList>

        {/* ── Entries tab ───────────────────────────────── */}
        <TabsContent value="entries">
          <div className="mt-3 space-y-3">
            {/* Mood calendar */}
            {entries.length > 0 && (
              <div className="p-3 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)]">
                <p className="text-xs text-[var(--text-tertiary)] mb-2">Ánimo — últimos 28 días</p>
                <MoodCalendar calendar={moodCalendar} />
              </div>
            )}

            {/* Search */}
            {entries.length > 0 && (
              <div className="relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
                <input
                  type="text"
                  placeholder="Buscar en el diario…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-[var(--r-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
                />
              </div>
            )}

            {/* Entry list */}
            {entries.length === 0 ? (
              <EmptyState
                icon={<BookOpen size={24} />}
                title="Diario vacío"
                description="Escribe tu primera entrada. La IA te ayudará a reflexionar con preguntas personalizadas."
                action={{ label: 'Escribir hoy', onClick: openNew }}
              />
            ) : filtered.length === 0 ? (
              <div className="text-center py-10">
                <Search size={24} className="mx-auto text-[var(--text-tertiary)] mb-2" />
                <p className="text-sm text-[var(--text-tertiary)]">Sin resultados para "{search}"</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                <div className="space-y-3">
                  {filtered.map(entry => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <EntryCard
                        entry={entry}
                        onSelect={openEdit}
                        onDelete={handleDelete}
                        onPin={handlePin}
                      />
                      {deleteConfirm === entry.id && (
                        <p className="text-[10px] text-[var(--danger)] text-center mt-1">
                          Pulsa eliminar de nuevo para confirmar
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            )}
          </div>
        </TabsContent>

        {/* ── Trends tab ────────────────────────────────── */}
        <TabsContent value="trends">
          {entries.length < 3 ? (
            <EmptyState
              icon={<BarChart2 size={24} />}
              title="Datos insuficientes"
              description="Escribe al menos 3 entradas para ver tus tendencias de ánimo."
              className="mt-4"
            />
          ) : (
            <div className="mt-3 space-y-4">
              <WritingStats entries={entries} streak={streak} />
              <MoodTrendChart entries={entries} />
              <EnergyMoodChart entries={entries} />
              <MoodDistributionChart entries={entries} />
              <TagFrequencyChart entries={entries} />
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Entry modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingEntry(null); }}
        title={editingEntry ? 'Editar entrada' : 'Nueva entrada'}
        size="lg"
      >
        <EntryForm
          initial={editingEntry}
          onSave={handleSave}
          onCancel={() => { setModalOpen(false); setEditingEntry(null); }}
          saving={saving}
        />
      </Modal>
    </div>
  );
}
