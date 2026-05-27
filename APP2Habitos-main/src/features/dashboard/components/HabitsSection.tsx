import {
  Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from 'recharts';
import { Flame, Trophy } from 'lucide-react';
import clsx from 'clsx';
import { fmt } from '../../../shared/utils/fmt';
import { ChartCard } from './ChartCard';
import type { Habit } from '../../habits/types';
import type { HabitStats } from '../../habits/types';

interface HabitsSectionProps {
  habits: Habit[];
  weekdayCompletion: { day: string; rate: number }[];
  streakLeaderboard: {
    habit: Habit;
    currentStreak: number;
    longestStreak: number;
    rate: number;
  }[];
  getStats: (id: string) => HabitStats | null;
}

export function HabitsSection({ habits, weekdayCompletion, streakLeaderboard, getStats }: HabitsSectionProps) {
  if (habits.filter(h => !h.archivedAt).length === 0) return null;

  const habitsWithStats = habits
    .filter(h => !h.archivedAt)
    .map(h => ({ habit: h, stats: getStats(h.id) }))
    .filter(x => x.stats)
    .sort((a, b) => (b.stats!.completionRate30d - a.stats!.completionRate30d));

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Hábitos</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Weekday radar */}
        <ChartCard title="Éxito por día de la semana" subtitle="Últimos 90 días">
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={weekdayCompletion} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <PolarGrid stroke="var(--border-subtle)" />
              <PolarAngleAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} />
              <Radar
                name="Completado %"
                dataKey="rate"
                stroke="var(--habit-color)"
                fill="var(--habit-color)"
                fillOpacity={0.25}
              />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 11 }}
                formatter={(v: number) => [fmt(v, { integer: true, unit: '%' }), 'Tasa']}
              />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Streak leaderboard */}
        <ChartCard title="Rachas actuales" subtitle="Top hábitos por racha">
          {streakLeaderboard.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">Sin datos aún</p>
          ) : (
            <div className="space-y-2 mt-1">
              {streakLeaderboard.map((item, i) => (
                <div key={item.habit.id} className="flex items-center gap-2.5">
                  <span className="w-5 text-xs text-[var(--text-tertiary)] text-right shrink-0">{i + 1}</span>
                  <span className="text-lg leading-none">{item.habit.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">{item.habit.name}</p>
                    <div className="h-1 bg-[var(--bg-base)] rounded-full mt-1 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${item.rate}%`,
                          backgroundColor: item.habit.color || 'var(--habit-color)',
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <Flame size={12} className="text-[var(--warning)]" />
                    <span className="text-xs font-bold text-[var(--text-primary)]">{item.currentStreak}</span>
                  </div>
                  {item.currentStreak === item.longestStreak && item.currentStreak > 0 && (
                    <Trophy size={11} className="text-[var(--warning)] shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </div>

      {/* Per-habit completion bars */}
      {habitsWithStats.length > 0 && (
        <ChartCard title="Tasa de completado (30d)" subtitle="Por hábito activo">
          <div className="space-y-2 mt-1">
            {habitsWithStats.slice(0, 8).map(({ habit, stats }) => {
              const rate = stats!.completionRate30d * 100;
              return (
                <div key={habit.id} className="flex items-center gap-2.5">
                  <span className="text-base leading-none w-5 shrink-0">{habit.emoji}</span>
                  <p className="text-xs text-[var(--text-secondary)] w-28 shrink-0 truncate">{habit.name}</p>
                  <div className="flex-1 h-2 bg-[var(--bg-base)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, rate)}%`,
                        backgroundColor: habit.color || 'var(--habit-color)',
                      }}
                    />
                  </div>
                  <span className={clsx(
                    'text-xs font-medium w-8 text-right shrink-0',
                    rate >= 70 ? 'text-[var(--success)]' :
                    rate >= 40 ? 'text-[var(--warning)]' : 'text-[var(--danger)]',
                  )}>
                    {fmt(rate, { integer: true })}%
                  </span>
                </div>
              );
            })}
          </div>
        </ChartCard>
      )}
    </section>
  );
}
