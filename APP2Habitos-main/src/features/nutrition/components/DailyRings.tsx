import clsx from 'clsx';
import type { Macros, NutritionTargets } from '../types';

interface RingProps {
  value: number;
  max: number;
  color: string;
  radius: number;
  strokeWidth: number;
}

function Ring({ value, max, color, radius, strokeWidth }: RingProps) {
  const circ = 2 * Math.PI * radius;
  const pct  = max > 0 ? Math.min(1, value / max) : 0;
  const dash = pct * circ;
  const over = value > max;

  return (
    <>
      <circle
        cx="50%" cy="50%" r={radius}
        fill="none"
        stroke="var(--bg-base)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx="50%" cy="50%" r={radius}
        fill="none"
        stroke={over ? 'var(--danger)' : color}
        strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        transform="rotate(-90 50 50)"
        style={{ transition: 'stroke-dasharray 0.5s ease' }}
      />
    </>
  );
}

interface DailyRingsProps {
  totals:  Macros;
  targets: NutritionTargets;
  size?:   number;
  className?: string;
}

export function DailyRings({ totals, targets, size = 160, className }: DailyRingsProps) {
  const half = size / 2;
  const rings = [
    { key: 'calories', label: 'kcal', color: 'var(--accent)',          radius: half - 10,  sw: 9,  value: totals.calories, max: targets.calories },
    { key: 'protein',  label: 'prot', color: 'var(--nutrition-color)', radius: half - 24,  sw: 8,  value: totals.protein,  max: targets.protein  },
    { key: 'carbs',    label: 'carbs',color: 'var(--warning)',          radius: half - 37,  sw: 7,  value: totals.carbs,    max: targets.carbs    },
    { key: 'fat',      label: 'gras', color: 'var(--journal-color)',   radius: half - 49,  sw: 6,  value: totals.fat,      max: targets.fat      },
  ];

  return (
    <div className={clsx('flex items-center gap-4', className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {rings.map(r => (
            <Ring key={r.key} value={r.value} max={r.max} color={r.color} radius={r.radius} strokeWidth={r.sw} />
          ))}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-[var(--text-primary)] leading-none">{totals.calories}</span>
          <span className="text-[10px] text-[var(--text-tertiary)]">/ {targets.calories} kcal</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2 flex-1">
        {rings.map(r => {
          const pct = r.max > 0 ? Math.round((r.value / r.max) * 100) : 0;
          const over = r.value > r.max;
          return (
            <div key={r.key} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                  <span className="text-xs text-[var(--text-tertiary)] capitalize">{r.key}</span>
                </div>
                <span className={clsx('text-xs font-medium', over ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]')}>
                  {r.value}<span className="text-[var(--text-tertiary)] font-normal">/{r.max}g</span>
                </span>
              </div>
              <div className="h-1 bg-[var(--bg-base)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pct)}%`, backgroundColor: over ? 'var(--danger)' : r.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface MacroBadgesProps {
  macros: Macros;
  size?: 'sm' | 'md';
}

export function MacroBadges({ macros, size = 'md' }: MacroBadgesProps) {
  const items = [
    { label: 'kcal', value: macros.calories, color: 'text-[var(--accent)]' },
    { label: 'P',    value: `${macros.protein}g`,  color: 'text-[var(--nutrition-color)]' },
    { label: 'C',    value: `${macros.carbs}g`,    color: 'text-[var(--warning)]' },
    { label: 'G',    value: `${macros.fat}g`,      color: 'text-[var(--journal-color)]' },
  ];
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map(i => (
        <div key={i.label} className={clsx(
          'flex items-baseline gap-0.5',
          size === 'sm' ? 'text-[10px]' : 'text-xs',
        )}>
          <span className={clsx('font-semibold', i.color)}>{i.value}</span>
          <span className="text-[var(--text-tertiary)]">{i.label}</span>
        </div>
      ))}
    </div>
  );
}
