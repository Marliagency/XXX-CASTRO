import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, TrendingUp, BarChart2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid,
} from 'recharts';
import { useWorkoutsStore } from '../store/workoutsStore';
import { EXERCISE_MAP } from '../data/exercises';
import { MUSCLE_GROUP_LABELS } from '../types';
import { calc1RM, calc1RMBrzycki, calc1RMLombardi } from '../types';
import { Button } from '../../../shared/components/ui';
import { fmt, fmtKg } from '../../../shared/utils/fmt';
import { CHART_THEME, AppleTooltip } from '../../../shared/utils/chartTheme';

const COLOR = '#ff3b30';

export default function ExerciseDetailView() {
  const { exerciseId } = useParams<{ exerciseId: string }>();
  const navigate = useNavigate();
  const { workouts } = useWorkoutsStore();

  const exercise = exerciseId ? EXERCISE_MAP.get(exerciseId) : null;

  type HistoryEntry = { date: string; label: string; weight: number; reps: number; e1rm: number; volume: number; sets: number };

  const history = useMemo((): HistoryEntry[] => {
    if (!exerciseId) return [];
    const result: HistoryEntry[] = [];
    for (const w of workouts) {
      const ex = w.exercises.find(e => e.exerciseId === exerciseId);
      if (!ex) continue;
      const working = ex.sets.filter(s => s.completed && s.weight != null && s.reps != null && s.type !== 'warmup');
      if (working.length === 0) continue;
      const topSet = working.reduce((best, s) =>
        calc1RM(s.weight!, s.reps!) > calc1RM(best.weight!, best.reps!) ? s : best
      );
      const totalVolume = working.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);
      result.push({
        date:   w.date,
        label:  format(parseISO(w.date), 'd MMM', { locale: es }),
        weight: topSet.weight!,
        reps:   topSet.reps!,
        e1rm:   Math.round(calc1RM(topSet.weight!, topSet.reps!)),
        volume: Math.round(totalVolume),
        sets:   working.length,
      });
    }
    return result;
  }, [workouts, exerciseId]);

  const pr1RM    = history.length > 0 ? Math.max(...history.map(h => h.e1rm)) : 0;
  const prWeight = history.length > 0 ? Math.max(...history.map(h => h.weight)) : 0;
  const lastSession = history[history.length - 1];

  if (!exercise) {
    return (
      <div className="p-4 max-w-2xl mx-auto">
        <Button variant="ghost" icon={<ArrowLeft size={14} />} onClick={() => navigate(-1)}>Volver</Button>
        <p className="mt-4 text-sm text-[var(--text-tertiary)]">Ejercicio no encontrado.</p>
      </div>
    );
  }

  const muscles = exercise.muscleGroups
    .map(m => MUSCLE_GROUP_LABELS[m] ?? m)
    .join(' · ');

  const orm1RMBreakdown = lastSession ? [
    { method: 'Epley',    value: Math.round(calc1RM(lastSession.weight, lastSession.reps)) },
    { method: 'Brzycki',  value: Math.round(calc1RMBrzycki(lastSession.weight, lastSession.reps)) },
    { method: 'Lombardi', value: Math.round(calc1RMLombardi(lastSession.weight, lastSession.reps)) },
    { method: 'Media',    value: Math.round((calc1RM(lastSession.weight, lastSession.reps) + calc1RMBrzycki(lastSession.weight, lastSession.reps) + calc1RMLombardi(lastSession.weight, lastSession.reps)) / 3) },
  ] : [];

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] transition-colors shrink-0"
        >
          <ArrowLeft size={18} className="text-[var(--text-secondary)]" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">{exercise.name}</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{muscles} · {exercise.equipment}</p>
        </div>
      </div>

      {/* PR stat cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="metric-card text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy size={12} className="text-[var(--warning)]" />
            <span className="text-[10px] text-[var(--text-tertiary)]">1RM est.</span>
          </div>
          <p className="mono" style={{ fontSize: 22, fontWeight: 700, color: COLOR }}>{fmt(pr1RM, { integer: true })}</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">kg</p>
        </div>
        <div className="metric-card text-center">
          <p className="text-[10px] text-[var(--text-tertiary)] mb-1">Peso máximo</p>
          <p className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(prWeight, { decimals: 1 })}</p>
          <p className="text-[10px] text-[var(--text-tertiary)]">kg</p>
        </div>
        <div className="metric-card text-center">
          <p className="text-[10px] text-[var(--text-tertiary)] mb-1">Sesiones</p>
          <p className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)' }}>{history.length}</p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <BarChart2 size={28} className="mx-auto text-[var(--text-tertiary)]" />
          <p className="text-sm text-[var(--text-tertiary)]">Sin historial aún. Registra este ejercicio para ver estadísticas.</p>
        </div>
      ) : (
        <>
          {/* 1RM trend */}
          <div className="metric-card">
            <div className="metric-card-header">
              <span className="metric-card-title">Progreso 1RM estimado</span>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={13} style={{ color: COLOR }} />
                <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: COLOR }}>{fmtKg(pr1RM)}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={history}>
                <CartesianGrid {...CHART_THEME.grid} />
                <XAxis dataKey="label" {...CHART_THEME.axis} interval="preserveStartEnd" />
                <YAxis {...CHART_THEME.axis} tickFormatter={v => fmt(v, { integer: true })} domain={['auto', 'auto']} width={36} />
                <Tooltip content={<AppleTooltip unit="kg" decimals={1} />} />
                <Line type="monotone" dataKey="e1rm" stroke={COLOR} strokeWidth={2.5} dot={{ fill: COLOR, r: 4, strokeWidth: 0 }} name="1RM est." />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Volume per session */}
          <div className="metric-card">
            <div className="metric-card-header">
              <span className="metric-card-title">Volumen por sesión</span>
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={history} barCategoryGap="30%">
                <CartesianGrid {...CHART_THEME.grid} />
                <XAxis dataKey="label" {...CHART_THEME.axis} interval="preserveStartEnd" />
                <YAxis {...CHART_THEME.axis} tickFormatter={v => fmt(v, { integer: true })} width={36} />
                <Tooltip content={<AppleTooltip unit="kg" decimals={0} />} />
                <Bar dataKey="volume" fill={COLOR} radius={[4, 4, 0, 0]} name="Volumen" fillOpacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 1RM formula breakdown */}
          {lastSession && (
            <div className="section-group">
              <p className="section-header">
                Desglose 1RM — {fmtKg(lastSession.weight)} × {lastSession.reps} reps
              </p>
              <div className="section-body">
                {orm1RMBreakdown.map(({ method, value }) => (
                  <div key={method} className="section-row">
                    <span className="section-row-label">{method}</span>
                    <span className="section-row-value" style={{ color: COLOR, fontWeight: 700 }}>{fmtKg(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Session history */}
          <div className="section-group">
            <p className="section-header">Historial de sesiones</p>
            <div className="section-body">
              {[...history].reverse().slice(0, 12).map((h, i) => (
                <div key={i} className="section-row">
                  <span className="text-xs text-[var(--text-tertiary)] w-14 shrink-0">{h.label}</span>
                  <div className="section-row-content">
                    <div>
                      <span className="section-row-label">{fmtKg(h.weight)} × {h.reps}</span>
                      <span className="section-row-value">{h.sets} sets</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold" style={{ color: COLOR }}>~{fmtKg(h.e1rm)}</span>
                      <span className="text-[9px] text-[var(--text-tertiary)]">1RM</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
