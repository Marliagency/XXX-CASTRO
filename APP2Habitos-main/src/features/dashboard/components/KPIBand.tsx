import { Flame, Dumbbell, Brain, TrendingUp, Trophy, Target } from 'lucide-react';
import clsx from 'clsx';
import { MiniSparkline } from './ChartCard';
import type { DayScore } from '../utils/aggregations';

interface KPIBandProps {
  lifeScore: number;
  trend7d: number;
  habitRate7d: number;
  workoutsThisWeek: number;
  totalPRs: number;
  totalWorkouts: number;
  last30Days: DayScore[];
}

interface KPICardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ReactNode;
  color: string;
  trend?: number;
  sparkData?: number[];
}

function KPICard({ label, value, sub, icon, color, trend, sparkData }: KPICardProps) {
  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-3 flex flex-col gap-2 min-w-0">
      <div className="flex items-center justify-between">
        <div className={clsx('w-7 h-7 rounded-[var(--r-lg)] flex items-center justify-center', color)}>
          {icon}
        </div>
        {sparkData && <MiniSparkline data={sparkData} />}
      </div>
      <div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-[var(--text-primary)] leading-none">{value}</span>
          {sub && <span className="text-xs text-[var(--text-tertiary)]">{sub}</span>}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[11px] text-[var(--text-tertiary)]">{label}</span>
          {trend !== undefined && trend !== 0 && (
            <span className={clsx(
              'text-[10px] font-medium',
              trend > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]',
            )}>
              {trend > 0 ? '+' : ''}{trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function KPIBand({ lifeScore, trend7d, habitRate7d, workoutsThisWeek, totalPRs, totalWorkouts, last30Days }: KPIBandProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <KPICard
        label="Life Score"
        value={lifeScore}
        sub="/ 100"
        icon={<Brain size={14} className="text-white" />}
        color="bg-[var(--accent)]"
        trend={trend7d}
        sparkData={last30Days.map(d => d.total)}
      />
      <KPICard
        label="Hábitos hoy"
        value={`${habitRate7d}%`}
        icon={<Flame size={14} className="text-white" />}
        color="bg-[var(--habit-color)]"
        sparkData={last30Days.map(d => d.habitsScore)}
      />
      <KPICard
        label="Entrenos semana"
        value={workoutsThisWeek}
        sub="/ 3"
        icon={<Dumbbell size={14} className="text-white" />}
        color="bg-[var(--neutral-900)]"
        sparkData={last30Days.map(d => d.workoutScore)}
      />
      <KPICard
        label="Total sesiones"
        value={totalWorkouts}
        icon={<Target size={14} className="text-white" />}
        color="bg-[var(--nutrition-color)]"
      />
      <KPICard
        label="PRs conseguidos"
        value={totalPRs}
        icon={<Trophy size={14} className="text-white" />}
        color="bg-[var(--warning)]"
      />
      <KPICard
        label="Tendencia 7d"
        value={trend7d > 0 ? `+${trend7d}` : trend7d}
        sub="pts"
        icon={<TrendingUp size={14} className="text-white" />}
        color={trend7d >= 0 ? 'bg-[var(--success)]' : 'bg-[var(--danger)]'}
      />
    </div>
  );
}
