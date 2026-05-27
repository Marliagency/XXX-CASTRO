import { useMemo } from 'react';
import { format, subDays, startOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid, ReferenceLine,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  LineChart, Line,
} from 'recharts';
import type { Workout } from '../types';
import { EXERCISE_MAP } from '../data/exercises';
import { MUSCLE_GROUP_LABELS } from '../types';
import { fmt, fmtKg } from '../../../shared/utils/fmt';
import { CHART_THEME, AppleTooltip } from '../../../shared/utils/chartTheme';

const COLOR = '#ff3b30';

// ── Volume by week (area chart) ───────────────────────────────────────────────
export function WorkoutsVolumeChart({ workouts }: { workouts: Workout[] }) {
  const { data, avg, vsLast } = useMemo(() => {
    if (workouts.length === 0) return { data: [], avg: 0, vsLast: null };

    // Last 8 weeks
    const weeks: { week: string; label: string; volume: number; count: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const d = subDays(new Date(), i * 7);
      const weekStart = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const weekEnd   = format(subDays(startOfWeek(subDays(d, -7), { weekStartsOn: 1 }), 1), 'yyyy-MM-dd');
      const label     = format(startOfWeek(d, { weekStartsOn: 1 }), 'd MMM', { locale: es });
      const inWeek    = workouts.filter(w => w.date >= weekStart && w.date <= weekEnd);
      weeks.push({
        week: weekStart, label,
        volume: Math.round(inWeek.reduce((s, w) => s + w.totalVolume, 0)),
        count: inWeek.length,
      });
    }

    const withData = weeks.filter(w => w.volume > 0);
    const avg = withData.length > 0
      ? Math.round(withData.reduce((s, w) => s + w.volume, 0) / withData.length)
      : 0;
    const lastTwo = weeks.slice(-2);
    const vsLast = lastTwo[0].volume > 0
      ? Math.round(((lastTwo[1].volume - lastTwo[0].volume) / lastTwo[0].volume) * 100)
      : null;

    return { data: weeks, avg, vsLast };
  }, [workouts]);

  if (data.length === 0 || data.every(d => d.volume === 0)) return null;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Volumen semanal</span>
        <div className="flex items-center gap-2">
          <span className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{fmt(avg / 1000, { decimals: 1 })}</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>t media</span>
          {vsLast !== null && (
            <span className={`delta-pill ${vsLast >= 0 ? 'delta-positive' : 'delta-negative'}`}>
              {vsLast >= 0 ? '+' : ''}{fmt(vsLast, { integer: true })}%
            </span>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLOR} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...CHART_THEME.grid} />
          <XAxis dataKey="label" {...CHART_THEME.axis} interval={1} />
          <YAxis {...CHART_THEME.axis} tickFormatter={v => fmt(v / 1000, { decimals: 1 })} width={32} />
          <Tooltip content={<AppleTooltip unit="kg" decimals={0} />} />
          {avg > 0 && (
            <ReferenceLine y={avg} stroke={COLOR} strokeDasharray="4 3" strokeWidth={1}
              label={{ value: 'Media', position: 'insideTopRight', fontSize: 10, fill: COLOR }} />
          )}
          <Area type="monotone" dataKey="volume" stroke={COLOR} strokeWidth={2} fill="url(#volGrad)" dot={false} name="Volumen" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Sessions frequency (bar chart last 12 weeks) ──────────────────────────────
export function WorkoutsFrequencyChart({ workouts, weeklyTarget }: { workouts: Workout[]; weeklyTarget?: number }) {
  const data = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => {
      const d = subDays(new Date(), (7 - i) * 7);
      const weekStart = format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const weekEnd   = format(subDays(startOfWeek(subDays(d, -7), { weekStartsOn: 1 }), 1), 'yyyy-MM-dd');
      const label     = format(startOfWeek(d, { weekStartsOn: 1 }), 'd/M', { locale: es });
      const count     = workouts.filter(w => w.date >= weekStart && w.date <= weekEnd).length;
      const isThis    = i === 7;
      return { label, count, isThis };
    });
  }, [workouts]);

  if (data.every(d => d.count === 0)) return null;

  const maxCount = Math.max(...data.map(d => d.count), 1);

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Frecuencia semanal</span>
        <span className="delta-pill delta-neutral">
          {data[data.length - 1]?.count ?? 0} esta semana
        </span>
      </div>
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} barCategoryGap="30%">
          <CartesianGrid {...CHART_THEME.grid} />
          <XAxis dataKey="label" {...CHART_THEME.axis} />
          <YAxis {...CHART_THEME.axis} tickFormatter={v => fmt(v, { integer: true })} domain={[0, maxCount + 1]} width={20} allowDecimals={false} />
          <Tooltip content={<AppleTooltip unit=" sesiones" decimals={0} />} />
          {weeklyTarget !== undefined && weeklyTarget > 0 && (
            <ReferenceLine y={weeklyTarget} stroke="var(--accent)" strokeDasharray="4 3" strokeWidth={1.5}
              label={{ value: `🎯 ${weeklyTarget}`, position: 'insideTopRight', fontSize: 10, fill: 'var(--accent)' }} />
          )}
          <Bar dataKey="count" radius={[5, 5, 0, 0]} name="Sesiones">
            {data.map((d, i) => (
              <Cell key={i} fill={d.isThis ? COLOR : weeklyTarget && d.count >= weeklyTarget ? '#34c759' : d.count >= 1 ? '#ff9500' : '#e5e5ea'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Muscle group distribution (radar) ────────────────────────────────────────
const MUSCLE_GROUPS_ORDER = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'core'];

export function MuscleDistributionChart({ workouts }: { workouts: Workout[] }) {
  const data = useMemo(() => {
    const cutoff = format(subDays(new Date(), 29), 'yyyy-MM-dd');
    const counts: Record<string, number> = {};

    workouts.filter(w => w.date >= cutoff).forEach(w => {
      w.exercises.forEach(ex => {
        const exercise = EXERCISE_MAP.get(ex.exerciseId);
        if (!exercise) return;
        exercise.muscleGroups.forEach(mg => {
          counts[mg] = (counts[mg] ?? 0) + 1;
        });
      });
    });

    return MUSCLE_GROUPS_ORDER.map(mg => ({
      label: MUSCLE_GROUP_LABELS[mg as keyof typeof MUSCLE_GROUP_LABELS] ?? mg,
      sets: counts[mg] ?? 0,
    }));
  }, [workouts]);

  if (data.every(d => d.sets === 0)) return null;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Grupos musculares</span>
        <span className="footnote" style={{ color: 'var(--text-secondary)' }}>últimos 30 días</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="rgba(60,60,67,0.08)" />
          <PolarAngleAxis dataKey="label" tick={{ fontSize: 10, fill: 'rgba(60,60,67,0.45)' }} />
          <Radar name="Sets" dataKey="sets" stroke={COLOR} fill={COLOR} fillOpacity={0.15} strokeWidth={2} />
          <Tooltip formatter={(v: number) => [fmt(v, { integer: true, unit: ' sets' }), 'Volumen']} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Top PRs list ──────────────────────────────────────────────────────────────
export function TopPRsChart({ workouts }: { workouts: Workout[] }) {
  const prs = useMemo(() => {
    const best: Record<string, { value: number; date: string }> = {};
    workouts.forEach(w => {
      w.prs.forEach(pr => {
        if (!best[pr.exerciseId] || pr.value > best[pr.exerciseId].value) {
          best[pr.exerciseId] = { value: pr.value, date: w.date };
        }
      });
    });
    return Object.entries(best)
      .map(([exId, { value, date }]) => ({
        name: EXERCISE_MAP.get(exId)?.name ?? exId.replace(/-/g, ' '),
        value,
        date,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [workouts]);

  if (prs.length === 0) return null;

  const max = prs[0].value;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Records personales (1RM)</span>
      </div>
      <div className="space-y-3 mt-2">
        {prs.map(pr => (
          <div key={pr.name}>
            <div className="flex items-center justify-between mb-1">
              <span className="subheadline" style={{ fontSize: 13, color: 'var(--text-primary)' }}>{pr.name}</span>
              <span className="mono" style={{ fontSize: 13, color: COLOR, fontWeight: 600 }}>{fmtKg(pr.value)}</span>
            </div>
            <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(pr.value / max) * 100}%`,
                background: COLOR,
                borderRadius: 2,
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── 1RM progression for top exercise ─────────────────────────────────────────
export function OneRMProgressionChart({ workouts }: { workouts: Workout[] }) {
  const { data, exerciseName } = useMemo(() => {
    const prByExercise: Record<string, number> = {};
    workouts.forEach(w => {
      w.prs.forEach(pr => {
        prByExercise[pr.exerciseId] = (prByExercise[pr.exerciseId] ?? 0) + 1;
      });
    });

    const topExId = Object.entries(prByExercise).sort((a, b) => b[1] - a[1])[0]?.[0];
    if (!topExId) return { data: [], exerciseName: '' };

    const exerciseName = EXERCISE_MAP.get(topExId)?.name ?? topExId;
    const points: { date: string; label: string; orm: number }[] = [];

    workouts.filter(w => w.prs.some(p => p.exerciseId === topExId))
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach(w => {
        const pr = w.prs.find(p => p.exerciseId === topExId);
        if (pr) {
          points.push({
            date: w.date,
            label: format(new Date(w.date + 'T12:00:00'), 'd MMM', { locale: es }),
            orm: Math.round(pr.value * 10) / 10,
          });
        }
      });

    return { data: points, exerciseName };
  }, [workouts]);

  if (data.length < 2) return null;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Progresión — {exerciseName}</span>
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <LineChart data={data}>
          <CartesianGrid {...CHART_THEME.grid} />
          <XAxis dataKey="label" {...CHART_THEME.axis} />
          <YAxis {...CHART_THEME.axis} tickFormatter={v => fmt(v, { integer: true })} width={36} domain={['auto', 'auto']} />
          <Tooltip content={<AppleTooltip unit="kg" decimals={1} />} />
          <Line type="monotone" dataKey="orm" stroke={COLOR} strokeWidth={2} dot={{ fill: COLOR, r: 4 }} name="1RM" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
