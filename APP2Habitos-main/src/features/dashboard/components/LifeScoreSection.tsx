import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';
import { ChartCard } from './ChartCard';
import type { DayScore, LifeScore } from '../utils/aggregations';

interface LifeScoreSectionProps {
  lifeScore: LifeScore;
  last30Days: DayScore[];
}

const COMPONENT_LABELS: Record<string, string> = {
  habits:    'Hábitos',
  workout:   'Entrenos',
  nutrition: 'Nutrición',
  journal:   'Diario',
  tasks:     'Tareas',
};

const COMPONENT_COLORS: Record<string, string> = {
  habits:    'var(--habit-color)',
  workout:   'var(--neutral-900)',
  nutrition: 'var(--nutrition-color)',
  journal:   'var(--journal-color)',
  tasks:     'var(--task-color)',
};

function LifeScoreRing({ score }: { score: number }) {
  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg width="128" height="128" className="-rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke="var(--bg-base)" strokeWidth="10" />
          <circle
            cx="64" cy="64" r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="10"
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[var(--text-primary)] leading-none">{score}</span>
          <span className="text-xs text-[var(--text-tertiary)]">/ 100</span>
        </div>
      </div>
    </div>
  );
}

export function LifeScoreSection({ lifeScore, last30Days }: LifeScoreSectionProps) {
  const chartData = last30Days.map(d => ({
    date: d.date,
    score: d.total,
    label: format(parseISO(d.date), 'd MMM', { locale: es }),
  }));

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-[var(--success)]';
    if (score >= 40) return 'text-[var(--warning)]';
    return 'text-[var(--danger)]';
  };

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Life Score</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Score ring + components */}
        <ChartCard title="Puntuación de hoy" subtitle="Basada en actividad diaria">
          <div className="flex items-center gap-4">
            <LifeScoreRing score={lifeScore.today} />
            <div className="flex-1 space-y-2">
              {Object.entries(lifeScore.components).map(([key, val]) => (
                <div key={key} className="space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[var(--text-tertiary)]">{COMPONENT_LABELS[key]}</span>
                    <span className={clsx('text-xs font-medium', getScoreColor(val))}>{val}</span>
                  </div>
                  <div className="h-1 bg-[var(--bg-base)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${val}%`, backgroundColor: COMPONENT_COLORS[key] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Trend chart */}
        <ChartCard title="Últimos 30 días" subtitle="Evolución del Life Score">
          <ResponsiveContainer width="100%" height={150}>
            <AreaChart data={chartData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="lifeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: 'var(--text-tertiary)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 11 }}
                cursor={{ stroke: 'var(--border-default)' }}
                formatter={(v: number) => [v, 'Score']}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="var(--accent)"
                strokeWidth={2}
                fill="url(#lifeGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
}
