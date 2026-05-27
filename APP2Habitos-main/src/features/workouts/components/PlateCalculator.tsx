import { useState } from 'react';
import { Input } from '../../../shared/components/ui';

const BAR_WEIGHT = 20; // kg — Olympic bar
const PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

const PLATE_COLORS: Record<number, string> = {
  25:   '#ef4444',
  20:   '#3b82f6',
  15:   '#f59e0b',
  10:   '#10b981',
  5:    '#ffffff',
  2.5:  '#6366f1',
  1.25: '#ec4899',
};

interface PlateConfig {
  plate: number;
  count: number;
}

function calcPlates(targetWeight: number): PlateConfig[] {
  const perSide = (targetWeight - BAR_WEIGHT) / 2;
  if (perSide <= 0) return [];

  const result: PlateConfig[] = [];
  let remaining = perSide;

  for (const plate of PLATES) {
    const count = Math.floor(remaining / plate);
    if (count > 0) {
      result.push({ plate, count });
      remaining -= count * plate;
      remaining = Math.round(remaining * 1000) / 1000; // floating point fix
    }
  }

  return result;
}

export function PlateCalculator() {
  const [target, setTarget] = useState('');

  const weight = Number(target) || 0;
  const plates = weight >= BAR_WEIGHT ? calcPlates(weight) : [];
  const achievable = weight >= BAR_WEIGHT;

  return (
    <div className="space-y-4">
      <Input
        type="number"
        value={target}
        onChange={e => setTarget(e.target.value)}
        label="Peso objetivo (kg)"
        placeholder={`Mínimo ${BAR_WEIGHT}kg (barra vacía)`}
        hint={`Barra olímpica: ${BAR_WEIGHT}kg`}
      />

      {target && !achievable && (
        <p className="text-sm text-[var(--warning)]">
          El peso mínimo es {BAR_WEIGHT}kg (barra vacía)
        </p>
      )}

      {achievable && plates.length > 0 && (
        <div className="space-y-3">
          {/* Visual bar */}
          <div className="flex items-center justify-center gap-0.5 py-4">
            {/* Left side */}
            <div className="flex items-center gap-0.5">
              {[...plates].reverse().flatMap(({ plate, count }) =>
                Array.from({ length: count }, (_, i) => (
                  <div
                    key={`L-${plate}-${i}`}
                    className="rounded-sm border border-black/10"
                    style={{
                      width: `${Math.max(8, plate * 0.6)}px`,
                      height: `${Math.max(24, plate * 3)}px`,
                      backgroundColor: PLATE_COLORS[plate] ?? '#ccc',
                    }}
                  />
                ))
              )}
            </div>
            {/* Bar */}
            <div className="w-24 h-3 bg-[var(--neutral-400)] rounded-full" />
            {/* Right side */}
            <div className="flex items-center gap-0.5">
              {plates.flatMap(({ plate, count }) =>
                Array.from({ length: count }, (_, i) => (
                  <div
                    key={`R-${plate}-${i}`}
                    className="rounded-sm border border-black/10"
                    style={{
                      width: `${Math.max(8, plate * 0.6)}px`,
                      height: `${Math.max(24, plate * 3)}px`,
                      backgroundColor: PLATE_COLORS[plate] ?? '#ccc',
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Plate list */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[var(--text-tertiary)]">Por lado:</p>
            {plates.map(({ plate, count }) => (
              <div key={plate} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-sm border border-black/10 shrink-0"
                  style={{ backgroundColor: PLATE_COLORS[plate] ?? '#ccc' }}
                />
                <span className="text-sm text-[var(--text-primary)]">
                  {count}× {plate}kg = {count * plate}kg
                </span>
              </div>
            ))}
            <div className="pt-1 border-t border-[var(--border-subtle)]">
              <span className="text-xs text-[var(--text-tertiary)]">
                Total: {BAR_WEIGHT}kg barra + {plates.reduce((s, p) => s + p.plate * p.count * 2, 0)}kg discos = <strong className="text-[var(--text-primary)]">{weight}kg</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {achievable && plates.length === 0 && (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-4">Barra vacía ({BAR_WEIGHT}kg)</p>
      )}
    </div>
  );
}
