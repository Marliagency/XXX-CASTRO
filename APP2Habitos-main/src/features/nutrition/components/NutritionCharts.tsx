import { useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, ReferenceLine, Cell,
  LineChart, Line, PieChart, Pie,
} from 'recharts';
import type { Meal } from '../types';
import type { BodyWeightEntry } from '../types';
import { fmt, fmtKcal, fmtKg } from '../../../shared/utils/fmt';
import { CHART_THEME, AppleTooltip } from '../../../shared/utils/chartTheme';

const COLOR = '#34c759';
const PROTEIN_COLOR = '#007aff';
const CARBS_COLOR   = '#ff9500';
const FAT_COLOR     = '#af52de';

interface StoreProps {
  meals: Meal[];
  bodyWeight: BodyWeightEntry[];
  targets: { calories: number; protein: number } | null;
  getTotalsForDate: (date: string) => { calories: number; protein: number; carbs: number; fat: number };
}

// ── 7-day calorie bar chart ───────────────────────────────────────────────────
export function CaloriesWeekChart({ store }: { store: StoreProps }) {
  const { data, avg, target } = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d    = subDays(new Date(), 6 - i);
      const date = format(d, 'yyyy-MM-dd');
      const label= format(d, 'EEE', { locale: es });
      const totals = store.getTotalsForDate(date);
      const isToday = date === format(new Date(), 'yyyy-MM-dd');
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1, 3),
        calories: totals.calories,
        isToday,
        date,
      };
    });
    const withData = days.filter(d => d.calories > 0);
    const avg = withData.length > 0
      ? Math.round(withData.reduce((s, d) => s + d.calories, 0) / withData.length)
      : 0;
    return { data: days, avg, target: store.targets?.calories ?? null };
  }, [store.meals, store.targets]);

  if (data.every(d => d.calories === 0)) return null;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Calorías — esta semana</span>
        <div className="flex items-center gap-2">
          <span className="mono" style={{ fontSize: 18, fontWeight: 700 }}>{fmt(avg, { integer: true })}</span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>kcal media</span>
        </div>
      </div>
      <div style={{ width: '100%', height: 160, overflow: 'hidden', position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="28%">
          <CartesianGrid {...CHART_THEME.grid} />
          <XAxis dataKey="label" {...CHART_THEME.axis} />
          <YAxis {...CHART_THEME.axis} tickFormatter={v => fmt(v / 1000, { decimals: 1 })} width={28} />
          <Tooltip content={<AppleTooltip unit="kcal" decimals={0} />} />
          {target && (
            <ReferenceLine y={target} stroke={COLOR} strokeDasharray="4 3" strokeWidth={1}
              label={{ value: 'Obj', position: 'insideTopRight', fontSize: 10, fill: COLOR }} />
          )}
          <Bar dataKey="calories" radius={[5, 5, 0, 0]} name="Calorías">
            {data.map((d, i) => (
              <Cell key={i} fill={
                d.calories === 0 ? '#e5e5ea'
                  : d.isToday ? PROTEIN_COLOR
                  : target && d.calories <= target * 1.1 ? COLOR
                  : '#ff9500'
              } />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Monthly calorie area chart ────────────────────────────────────────────────
export function CaloriesMonthChart({ store }: { store: StoreProps }) {
  const { data, avg, vsLastMonth } = useMemo(() => {
    const now   = new Date();
    const start = startOfMonth(now);
    const end   = endOfMonth(now);
    const days  = eachDayOfInterval({ start, end });

    const monthData = days.map(day => {
      const date  = format(day, 'yyyy-MM-dd');
      const label = format(day, 'd');
      const totals= store.getTotalsForDate(date);
      return { date, label, calories: totals.calories, protein: totals.protein };
    });

    const pastDays = monthData.filter(d => d.date <= format(now, 'yyyy-MM-dd') && d.calories > 0);
    const avg = pastDays.length > 0
      ? Math.round(pastDays.reduce((s, d) => s + d.calories, 0) / pastDays.length)
      : 0;

    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastDays = eachDayOfInterval({ start: lastMonthStart, end: lastMonthEnd });
    const lastWithData = lastDays
      .map(d => store.getTotalsForDate(format(d, 'yyyy-MM-dd')).calories)
      .filter(c => c > 0);
    const lastAvg = lastWithData.length > 0
      ? Math.round(lastWithData.reduce((a, b) => a + b, 0) / lastWithData.length)
      : null;

    return {
      data: monthData,
      avg,
      vsLastMonth: lastAvg !== null && avg > 0 ? avg - lastAvg : null,
    };
  }, [store.meals]);

  if (data.every(d => d.calories === 0)) return null;

  const monthName = format(new Date(), 'MMMM', { locale: es });
  const target = store.targets?.calories ?? null;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title capitalize">{monthName}</span>
        <div className="flex items-center gap-2">
          <span className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{fmt(avg, { integer: true })}</span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>kcal</span>
          {vsLastMonth !== null && (
            <span className={`delta-pill ${vsLastMonth <= 0 ? 'delta-positive' : 'delta-negative'}`}>
              {vsLastMonth >= 0 ? '+' : ''}{fmt(vsLastMonth, { integer: true })}
            </span>
          )}
        </div>
      </div>
      <div style={{ width: '100%', height: 180, overflow: 'hidden', position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="calGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLOR} stopOpacity={0.15} />
              <stop offset="95%" stopColor={COLOR} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...CHART_THEME.grid} />
          <XAxis dataKey="label" {...CHART_THEME.axis} interval={4} />
          <YAxis {...CHART_THEME.axis} tickFormatter={v => fmt(v, { integer: true })} width={36} />
          <Tooltip content={<AppleTooltip unit="kcal" decimals={0} />} />
          {target && (
            <ReferenceLine y={target} stroke={COLOR} strokeDasharray="4 3" strokeWidth={1}
              label={{ value: 'Obj', position: 'insideTopRight', fontSize: 10, fill: COLOR }} />
          )}
          <Area type="monotone" dataKey="calories" stroke={COLOR} strokeWidth={2} fill="url(#calGrad)" dot={false} name="Calorías" />
        </AreaChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Macro split bar chart (last 7 days average) ───────────────────────────────
export function MacroSplitChart({ store }: { store: StoreProps }) {
  const data = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date  = format(subDays(new Date(), 6 - i), 'yyyy-MM-dd');
      const label = format(subDays(new Date(), 6 - i), 'EEE', { locale: es });
      const t     = store.getTotalsForDate(date);
      return {
        label: label.charAt(0).toUpperCase() + label.slice(1, 3),
        protein: t.protein,
        carbs: t.carbs,
        fat: t.fat,
      };
    }).filter(d => d.protein + d.carbs + d.fat > 0);
  }, [store.meals]);

  if (data.length === 0) return null;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Macros diarios</span>
        <div className="flex items-center gap-2.5">
          {[{ label: 'P', color: PROTEIN_COLOR }, { label: 'C', color: CARBS_COLOR }, { label: 'G', color: FAT_COLOR }].map(m => (
            <div key={m.label} className="flex items-center gap-1">
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color }} />
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ width: '100%', height: 160, overflow: 'hidden', position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap="25%" barGap={2}>
          <CartesianGrid {...CHART_THEME.grid} />
          <XAxis dataKey="label" {...CHART_THEME.axis} />
          <YAxis {...CHART_THEME.axis} tickFormatter={v => fmt(v, { integer: true })} width={28} />
          <Tooltip content={<AppleTooltip unit="g" decimals={0} />} />
          <Bar dataKey="protein" fill={PROTEIN_COLOR} radius={[3, 3, 0, 0]} name="Proteínas" />
          <Bar dataKey="carbs"   fill={CARBS_COLOR}   radius={[3, 3, 0, 0]} name="Carbos" />
          <Bar dataKey="fat"     fill={FAT_COLOR}     radius={[3, 3, 0, 0]} name="Grasas" />
        </BarChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Body weight line chart ────────────────────────────────────────────────────
export function BodyWeightChart({ bodyWeight }: { bodyWeight: BodyWeightEntry[] }) {
  const data = useMemo(() => {
    return [...bodyWeight]
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30)
      .map(e => ({
        label: format(new Date(e.date + 'T12:00:00'), 'd MMM', { locale: es }),
        weight: e.weight,
      }));
  }, [bodyWeight]);

  if (data.length < 2) return null;

  const weights = data.map(d => d.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const delta = data.length > 1 ? data[data.length - 1].weight - data[0].weight : 0;

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Peso corporal</span>
        <div className="flex items-center gap-2">
          <span className="mono" style={{ fontSize: 20, fontWeight: 700 }}>{fmtKg(data[data.length - 1].weight)}</span>
          {delta !== 0 && (
            <span className={`delta-pill ${delta < 0 ? 'delta-positive' : 'delta-negative'}`}>
              {delta >= 0 ? '+' : ''}{fmt(delta, { decimals: 1 })} kg
            </span>
          )}
        </div>
      </div>
      <div style={{ width: '100%', height: 150, overflow: 'hidden', position: 'relative' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid {...CHART_THEME.grid} />
          <XAxis dataKey="label" {...CHART_THEME.axis} interval="preserveStartEnd" />
          <YAxis {...CHART_THEME.axis} tickFormatter={v => fmt(v, { integer: true })} domain={[min - 1, max + 1]} width={36} />
          <Tooltip content={<AppleTooltip unit="kg" decimals={1} />} />
          <Line type="monotone" dataKey="weight" stroke={PROTEIN_COLOR} strokeWidth={2} dot={{ fill: PROTEIN_COLOR, r: 3 }} name="Peso" />
        </LineChart>
      </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Macro ratio donut (today) ─────────────────────────────────────────────────
export function MacroRatioChart({ store }: { store: StoreProps }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const t = store.getTotalsForDate(today);

  const total = t.protein * 4 + t.carbs * 4 + t.fat * 9;
  if (total === 0) return null;

  const data = [
    { name: 'Proteínas', value: Math.round((t.protein * 4 / total) * 100), fill: PROTEIN_COLOR },
    { name: 'Carbos',    value: Math.round((t.carbs   * 4 / total) * 100), fill: CARBS_COLOR },
    { name: 'Grasas',    value: Math.round((t.fat     * 9 / total) * 100), fill: FAT_COLOR },
  ];

  return (
    <div className="metric-card">
      <div className="metric-card-header">
        <span className="metric-card-title">Distribución de macros hoy</span>
        <span className="footnote" style={{ color: 'var(--text-secondary)' }}>{fmtKcal(t.calories)}</span>
      </div>
      <div className="flex items-center gap-4">
        <div style={{ width: 120, height: 120, flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={32} outerRadius={52} strokeWidth={0}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        </div>
        <div className="space-y-2 flex-1">
          {[
            { label: 'Proteínas', value: t.protein, unit: 'g', color: PROTEIN_COLOR, target: store.targets?.protein },
            { label: 'Carbohidratos', value: t.carbs, unit: 'g', color: CARBS_COLOR },
            { label: 'Grasas', value: t.fat, unit: 'g', color: FAT_COLOR },
          ].map(m => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{m.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: m.color, fontFamily: 'monospace' }}>
                  {fmt(m.value, { integer: true })}{m.unit}
                  {m.target ? <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>/{fmt(m.target, { integer: true })}</span> : null}
                </span>
              </div>
              {m.target && (
                <div style={{ height: 3, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, (m.value / m.target) * 100)}%`,
                    background: m.color,
                    borderRadius: 2,
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
