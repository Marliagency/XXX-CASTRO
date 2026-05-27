import { Flame, Award, Target, TrendingUp } from 'lucide-react';
import { ProgressBar } from '../../../shared/components/ui';
import { fmt } from '../../../shared/utils/fmt';
import type { HabitStats } from '../types';

interface HabitStatsProps {
  stats: HabitStats;
  color: string;
}

export function HabitStatsDisplay({ stats, color }: HabitStatsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame size={14} />}
          label="Racha actual"
          value={`${stats.currentStreak} días`}
          iconColor={stats.currentStreak > 0 ? '#f59e0b' : undefined}
        />
        <StatCard
          icon={<Award size={14} />}
          label="Racha máxima"
          value={`${stats.longestStreak} días`}
        />
        <StatCard
          icon={<Target size={14} />}
          label="Últimos 7 días"
          value={`${fmt(stats.completionRate7d * 100, { integer: true })}%`}
          iconColor={color}
        />
        <StatCard
          icon={<TrendingUp size={14} />}
          label="Últimos 30 días"
          value={`${fmt(stats.completionRate30d * 100, { integer: true })}%`}
          iconColor={color}
        />
      </div>
      <ProgressBar
        value={stats.completionRate30d * 100}
        color={color}
        label={`Total completados: ${stats.totalCompletions}`}
      />
    </div>
  );
}

function StatCard({
  icon, label, value, iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconColor?: string;
}) {
  return (
    <div className="bg-[var(--bg-base)] rounded-[var(--r-lg)] p-3">
      <div
        className="flex items-center gap-1.5 text-[var(--text-tertiary)] mb-1"
        style={iconColor ? { color: iconColor } : undefined}
      >
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
