import { useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  AreaChart, Area, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ReferenceLine,
} from 'recharts';
import type { Habit, HabitEntry } from '../types';
import { fmt, fmtPct } from '../../../shared/utils/fmt';
import { CHART_THEME, AppleTooltip } from '../../../shared/utils/chartTheme';

const COLOR = '#007aff';

// ── Weekly bar chart ─────────────────────────────────────────────────────────
export function HabitsWeeklyChart({ habits, entries }: { habits: Habit[]; entries: HabitEntry[] }) {
  const data = useMemo(() => {
    const active = habits.filter(h => !h.archivedAt);
    if (active.length === 0) return [];
    return Array.from({ length: 7 }, (_, i) => {
      const date = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
      const label = format(subDays(new Date(), 6 - i), 'EEE', { locale: es });
      const completed = entries.filter(e => e.date === date && e.count > 0).length;
      const total = active.length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const isToday = date === format(new Date(), 'yyyy-MM-dd');
      return { date, label: label.charAt(0).toUpperCase() + label.slice(1, 3), completed, total, pct, isToday };
    });
  }, [habits, entries]);

  const avg = data.length > 0 ? Math.round(data.reduce((s, d) => s + d.pct, 0) / data.length) : 0;

  if (data.length === 0) return null;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Esta semana</span>
        <span className="delta-pill delta-neutral">{fmtPct(avg)} media</span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} barCategoryGap="28%">
          <CartesianGrid {...CHART_THEME.grid} />
          <XAxis dataKey="label" {...CHART_THEME.axis} />
          <YAxis {...CHART_THEME.axis} tickFormatter={v => fmt(v, { integer: true })} domain={[0, 100]} width={28} />
          <Tooltip
            content={<AppleTooltip unit="%" decimals={0} />}
            formatter={(v: number) => [fmt(v, { integer: true, unit: '%' }), 'Completado']}
          />
          <Bar dataKey="pct" radius={[5, 5, 0, 0]} name="Completado">
            {data.map((d, i) => (
              <Cell key={i}
                fill={d.isToday ? COLOR : d.pct >= 80 ? '#34c759' : d.pct >= 50 ? '#ff9500' : d.pct > 0 ? '#ff3b30' : '#e5e5ea'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between mt-2 px-1">
        <span className="footnote" style={{ color: 'var(--text-secondary)' }}>
          Media: <strong>{fmtPct(avg)}</strong>
        </span>
        <span className="caption-2" style={{ color: 'var(--text-tertiary)' }}>
          Hoy: <strong style={{ color: COLOR }}>{fmtPct(data[6]?.pct ?? 0)}</strong>
        </span>
      </div>
    </div>
  );
}

// ── Monthly area chart ────────────────────────────────────────────────────────
export function HabitsMonthlyChart({ habits, entries }: { habits: Habit[]; entries: HabitEntry[] }) {
  const { data, avg, vsLastMonth } = useMemo(() => {
    const active = habits.filter(h => !h.archivedAt);
    if (active.length === 0) return { data: [], avg: 0, vsLastMonth: null };

    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    const days = eachDayOfInterval({ start, end });

    const monthData = days.map(day => {
      const date = format(day, 'yyyy-MM-dd');
      const label = format(day, 'd');
      const completed = entries.filter(e => e.date === date && e.count > 0).length;
      const pct = active.length > 0 ? Math.round((completed / active.length) * 100) : 0;
      return { date, label, pct };
    });

    const pastDays = monthData.filter(d => d.date <= format(now, 'yyyy-MM-dd'));
    const monthAvg = pastDays.length > 0
      ? Math.round(pastDays.reduce((s, d) => s + d.pct, 0) / pastDays.length)
      : 0;

    // Last month
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastDays = eachDayOfInterval({ start: lastMonthStart, end: lastMonthEnd });
    const lastData = lastDays.map(day => {
      const date = format(day, 'yyyy-MM-dd');
      const completed = entries.filter(e => e.date === date && e.count > 0).length;
      return active.length > 0 ? Math.round((completed / active.length) * 100) : 0;
    });
    const lastAvg = lastData.length > 0
      ? Math.round(lastData.reduce((a, b) => a + b, 0) / lastData.length)
      : null;

    return { data: monthData, avg: monthAvg, vsLastMonth: lastAvg !== null ? monthAvg - lastAvg : null };
  }, [habits, entries]);

  if (data.length === 0) return null;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">{format(new Date(), 'MMMM', { locale: es })}</span>
        <div className="flex items-center gap-2">
          <span className="mono" style={{ fontSize: 22, fontWeight: 700 }}>{fmt(avg, { integer: true })}</span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>%</span>
          {vsLastMonth !== null && (
            <span className={`delta-pill ${vsLastMonth >= 0 ? 'delta-positive' : 'delta-negative'}`}>
              {vsLastMonth >= 0 ? '+' : ''}{fmt(vsLastMonth, { integer: true })}%
            </span>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="habitGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLOR} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...CHART_THEME.grid} />
          <XAxis dataKey="label" {...CHART_THEME.axis} interval={4} />
          <YAxis {...CHART_THEME.axis} tickFormatter={v => fmt(v, { integer: true })} domain={[0, 100]} width={28} />
          <Tooltip
            content={<AppleTooltip unit="%" decimals={0} />}
            formatter={(v: number) => [fmt(v, { integer: true, unit: '%' }), 'Completado']}
          />
          <ReferenceLine y={70} stroke="#34c759" strokeDasharray="4 3" strokeWidth={1}
            label={{ value: '70%', position: 'insideTopRight', fontSize: 10, fill: '#34c759' }} />
          <Area type="monotone" dataKey="pct" stroke={COLOR} strokeWidth={2} fill="url(#habitGrad)" dot={false} name="Completado" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Per-habit breakdown ───────────────────────────────────────────────────────
export function HabitBreakdownChart({ habits, entries }: { habits: Habit[]; entries: HabitEntry[] }) {
  const data = useMemo(() => {
    const active = habits.filter(h => !h.archivedAt);
    const cutoff = format(subDays(new Date(), 29), 'yyyy-MM-dd');
    const today  = format(new Date(), 'yyyy-MM-dd');

    return active.map(h => {
      const hEntries = entries.filter(e => e.habitId === h.id && e.date >= cutoff && e.date <= today && e.count > 0);
      const rate = Math.round((hEntries.length / 30) * 100);
      return { name: h.name, emoji: h.emoji, color: h.color, rate };
    }).sort((a, b) => b.rate - a.rate);
  }, [habits, entries]);

  if (data.length === 0) return null;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Por hábito — últimos 30 días</span>
      </div>
      <div className="space-y-3 mt-2">
        {data.map(h => (
          <div key={h.name}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span style={{ fontSize: 15 }}>{h.emoji}</span>
                <span className="subheadline" style={{ fontSize: 14, color: 'var(--text-primary)' }}>{h.name}</span>
              </div>
              <span className="mono" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                {fmtPct(h.rate)}
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${h.rate}%`, background: h.color,
                borderRadius: 2, transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Radar by weekday ──────────────────────────────────────────────────────────
const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function HabitsWeekdayRadar({ habits, entries }: { habits: Habit[]; entries: HabitEntry[] }) {
  const data = useMemo(() => {
    const active = habits.filter(h => !h.archivedAt);
    if (active.length === 0) return [];
    const cutoff = format(subDays(new Date(), 89), 'yyyy-MM-dd');
    const byDay: number[] = [0, 0, 0, 0, 0, 0, 0];
    const countDay: number[] = [0, 0, 0, 0, 0, 0, 0];

    entries.filter(e => e.date >= cutoff && e.count > 0).forEach(e => {
      const dow = new Date(e.date + 'T12:00:00').getDay();
      byDay[dow]++;
      countDay[dow]++;
    });

    return DAY_LABELS.map((label, i) => ({
      label,
      completions: countDay[i] > 0 ? Math.round((byDay[i] / (countDay[i] * active.length / 7)) * 100) : 0,
    }));
  }, [habits, entries]);

  if (data.length === 0) return null;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Constancia por día</span>
        <span className="footnote" style={{ color: 'var(--text-secondary)' }}>últimos 90 días</span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
          <PolarGrid stroke="rgba(60,60,67,0.08)" />
          <PolarAngleAxis dataKey="label" tick={{ fontSize: 11, fill: 'rgba(60,60,67,0.45)' }} />
          <Radar name="Completado" dataKey="completions" stroke={COLOR} fill={COLOR} fillOpacity={0.15} strokeWidth={2} />
          <Tooltip formatter={(v: number) => [fmt(v, { integer: true, unit: '%' }), 'Completado']} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
