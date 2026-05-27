import { fmt } from '../../../shared/utils/fmt';

interface Ring {
  value: number;   // 0–100
  color: string;
  label: string;
  sublabel?: string;
}

interface ActivityRingsProps {
  rings: Ring[];
  size?: number;
}

const GAP = 6;
const STROKE_WIDTH = 11;

export function ActivityRings({ rings, size = 120 }: ActivityRingsProps) {
  const center = size / 2;
  const numRings = rings.length;

  const radii = Array.from({ length: numRings }, (_, i) =>
    center - STROKE_WIDTH / 2 - i * (STROKE_WIDTH + GAP)
  );

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} style={{ overflow: 'visible', flexShrink: 0 }}>
        {rings.map((ring, i) => {
          const r = radii[i];
          const circumference = 2 * Math.PI * r;
          const dashOffset = circumference * (1 - Math.min(ring.value, 100) / 100);
          const glowId  = `ring-glow-${i}`;

          return (
            <g key={i}>
              {/* Glow filter */}
              <defs>
                <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Track (background ring) */}
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={`${ring.color}20`}
                strokeWidth={STROKE_WIDTH}
              />

              {/* Progress arc */}
              <circle
                cx={center}
                cy={center}
                r={r}
                fill="none"
                stroke={ring.color}
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform={`rotate(-90 ${center} ${center})`}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
                filter={ring.value > 0 ? `url(#${glowId})` : undefined}
              />

              {/* End cap dot for completed rings */}
              {ring.value >= 100 && (
                <circle
                  cx={center + r * Math.cos(-Math.PI / 2)}
                  cy={center + r * Math.sin(-Math.PI / 2)}
                  r={STROKE_WIDTH / 2}
                  fill={ring.color}
                />
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="space-y-2 flex-1">
        {rings.map((ring, i) => (
          <div key={i} className="flex items-center gap-2">
            <div style={{
              width: 10, height: 10, borderRadius: '50%',
              background: ring.color, flexShrink: 0,
            }} />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between">
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{ring.label}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: ring.color, fontFamily: 'monospace' }}>
                  {fmt(ring.value, { integer: true })}%
                </span>
              </div>
              {ring.sublabel && (
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{ring.sublabel}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
