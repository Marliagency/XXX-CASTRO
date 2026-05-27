import type { TooltipProps } from 'recharts';
import { fmt } from './fmt';

export const CHART_COLORS = {
  habits:    '#007aff',
  workouts:  '#ff3b30',
  nutrition: '#34c759',
  journal:   '#af52de',
  tasks:     '#ff9500',
  goals:     '#5856d6',
  body:      '#5ac8fa',
};

export const CHART_THEME = {
  grid: {
    strokeDasharray: '0' as const,
    stroke: 'rgba(60,60,67,0.08)',
    vertical: false,
  },
  axis: {
    tick: { fill: 'rgba(60,60,67,0.45)', fontSize: 11 },
    axisLine: { stroke: 'rgba(60,60,67,0.12)' },
    tickLine: false as const,
  },
};

interface AppleTooltipProps extends TooltipProps<number, string> {
  unit?: string;
  decimals?: number;
}

export function AppleTooltip({ active, payload, label, unit = '', decimals = 0 }: AppleTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(255,255,255,0.94)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '0.5px solid rgba(60,60,67,0.20)',
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      minWidth: 120,
    }}>
      {label && (
        <p style={{ fontSize: 11, color: 'rgba(60,60,67,0.45)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: i < payload.length - 1 ? 4 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color ?? '#007aff', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: 'rgba(60,60,67,0.6)' }}>{entry.name}</span>
          </div>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, fontWeight: 600, color: '#000' }}>
            {fmt(Number(entry.value), { decimals, unit })}
          </span>
        </div>
      ))}
    </div>
  );
}
