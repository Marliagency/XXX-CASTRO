import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { Trophy, Zap } from 'lucide-react';
import { fmt } from '../../../shared/utils/fmt';
import { ChartCard } from './ChartCard';
import { EXERCISE_MAP } from '../../workouts/data/exercises';
import type { Workout } from '../../workouts/types';

interface WorkoutsSectionProps {
  workouts: Workout[];
  weeklyVolume: { week: string; volume: number; count: number }[];
  totalPRs: number;
}

export function WorkoutsSection({ workouts, weeklyVolume, totalPRs }: WorkoutsSectionProps) {
  if (workouts.length === 0) return null;

  const avgVolume = weeklyVolume.filter(w => w.volume > 0).reduce((s, w) => s + w.volume, 0) /
    Math.max(1, weeklyVolume.filter(w => w.volume > 0).length);

  const weeklyCount = weeklyVolume.map(w => ({ week: w.week, count: w.count }));

  const recentPRs = workouts
    .flatMap(w => w.prs.map(pr => ({
      ...pr,
      workoutDate: w.date,
      workoutName: w.name,
      exerciseName: EXERCISE_MAP.get(pr.exerciseId)?.name ?? pr.exerciseId,
    })))
    .sort((a, b) => b.workoutDate.localeCompare(a.workoutDate))
    .slice(0, 5);

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Entrenamientos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Weekly volume chart */}
        <ChartCard title="Volumen semanal" subtitle="Últimas 8 semanas (kg)">
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyVolume} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 11 }}
                cursor={{ fill: 'var(--bg-hover)' }}
                formatter={(v: number) => [`${v.toLocaleString('es')} kg`, 'Volumen']}
              />
              <Bar dataKey="volume" fill="var(--neutral-900)" radius={[3, 3, 0, 0]} name="Volumen" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Weekly frequency */}
        <ChartCard title="Sesiones por semana">
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={weeklyCount} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
              <XAxis dataKey="week" tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }} tickLine={false} axisLine={false} />
              <YAxis
                tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 11 }}
                cursor={{ stroke: 'var(--border-default)' }}
                formatter={(v: number) => [v, 'Sesiones']}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="var(--accent)"
                strokeWidth={2}
                dot={{ fill: 'var(--accent)', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] p-3 text-center">
          <p className="text-xl font-bold text-[var(--text-primary)]">{workouts.length}</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Total sesiones</p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] p-3 text-center">
          <p className="text-xl font-bold text-[var(--text-primary)]">{fmt(avgVolume / 1000, { decimals: 1 })}t</p>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Vol. medio/semana</p>
        </div>
        <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-lg)] p-3 text-center flex flex-col items-center">
          <div className="flex items-center gap-1">
            <Trophy size={14} className="text-[var(--warning)]" />
            <p className="text-xl font-bold text-[var(--text-primary)]">{totalPRs}</p>
          </div>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">PRs totales</p>
        </div>
      </div>

      {/* Recent PRs */}
      {recentPRs.length > 0 && (
        <ChartCard title="PRs recientes" action={<Zap size={14} className="text-[var(--warning)]" />}>
          <div className="space-y-1.5 mt-1">
            {recentPRs.map((pr, i) => (
              <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-[var(--r-md)] bg-[var(--bg-base)]">
                <Trophy size={12} className="text-[var(--warning)] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">{pr.exerciseName}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">{pr.workoutName}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-bold text-[var(--text-primary)]">{pr.value} {pr.type === '1RM' ? 'kg 1RM' : pr.type === 'reps' ? 'reps' : 'kg vol'}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      )}
    </section>
  );
}
