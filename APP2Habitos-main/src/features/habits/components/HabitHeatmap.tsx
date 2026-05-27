import { format, subDays, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import type { HabitEntry } from '../types';

interface HabitHeatmapProps {
  entries: HabitEntry[];
  color: string;
  targetCount?: number;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function colorWithAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function HabitHeatmap({ entries, color, targetCount = 1 }: HabitHeatmapProps) {
  const today = new Date();

  const days = Array.from({ length: 91 }, (_, i) => {
    const date = subDays(today, 90 - i);
    const ds = format(date, 'yyyy-MM-dd');
    const entry = entries.find(e => e.date === ds);
    const count = entry?.skipped ? 0 : (entry?.count ?? 0);
    const intensity = Math.min(count / targetCount, 1);
    return { date, ds, intensity, skipped: entry?.skipped ?? false };
  });

  // Pad start so first day lands on correct weekday column
  const firstDayOfWeek = days[0].date.getDay(); // 0=Sun
  const paddedDays: (typeof days[0] | null)[] = [
    ...Array.from({ length: firstDayOfWeek }, () => null),
    ...days,
  ];

  // Group into weeks
  const weeks: (typeof days[0] | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-0.5 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-0.5">
            {week.map((day, di) =>
              day ? (
                <div
                  key={day.ds}
                  title={`${format(day.date, 'd MMM', { locale: es })}: ${
                    day.intensity > 0 ? 'completado' : day.skipped ? 'saltado' : 'pendiente'
                  }`}
                  className="w-3 h-3 rounded-[2px] transition-colors"
                  style={{
                    backgroundColor: day.intensity > 0
                      ? colorWithAlpha(color, 0.2 + day.intensity * 0.8)
                      : 'var(--neutral-100)',
                    opacity: day.skipped ? 0.4 : 1,
                  }}
                />
              ) : (
                <div key={`empty-${di}`} className="w-3 h-3" />
              )
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
        <span>Hace 90 días</span>
        <div className="flex items-center gap-1">
          <span>Menos</span>
          {[0, 0.25, 0.5, 0.75, 1].map(v => (
            <div
              key={v}
              className="w-2.5 h-2.5 rounded-[2px]"
              style={{
                backgroundColor: v > 0 ? colorWithAlpha(color, 0.2 + v * 0.8) : 'var(--neutral-100)',
              }}
            />
          ))}
          <span>Más</span>
        </div>
        <span>Hoy</span>
      </div>
    </div>
  );
}

// Suppress unused import warning — parseISO is used via the es locale import pattern
void parseISO;
