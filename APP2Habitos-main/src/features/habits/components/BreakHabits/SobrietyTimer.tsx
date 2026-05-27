import { useEffect, useState } from 'react';

interface Elapsed {
  days:    number;
  hours:   number;
  minutes: number;
  seconds: number;
}

function getElapsed(startDate: string): Elapsed {
  const totalSeconds = Math.max(0, Math.floor((Date.now() - new Date(startDate).getTime()) / 1000));
  return {
    days:    Math.floor(totalSeconds / 86400),
    hours:   Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

interface SobrietyTimerProps {
  startDate: string;
}

export function SobrietyTimer({ startDate }: SobrietyTimerProps) {
  const [elapsed, setElapsed] = useState<Elapsed>(() => getElapsed(startDate));

  useEffect(() => {
    setElapsed(getElapsed(startDate));
    const interval = setInterval(() => setElapsed(getElapsed(startDate)), 1000);
    return () => clearInterval(interval);
  }, [startDate]);

  return (
    <div>
      {/* Días — grande */}
      <div className="flex items-baseline justify-center gap-1">
        <span
          className="tabular"
          style={{
            fontSize: 52,
            fontWeight: 700,
            letterSpacing: '-2px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-mono)',
            lineHeight: 1,
          }}
        >
          {elapsed.days}
        </span>
        <span style={{ fontSize: 18, color: 'var(--text-secondary)', marginBottom: 4 }}>
          días
        </span>
      </div>

      {/* Horas, minutos, segundos */}
      <div className="flex justify-center gap-4 mt-1">
        {([
          { value: elapsed.hours,   label: 'horas' },
          { value: elapsed.minutes, label: 'min' },
          { value: elapsed.seconds, label: 'seg' },
        ] as const).map(item => (
          <div key={item.label} className="text-center">
            <span
              className="tabular"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 20,
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}
            >
              {String(item.value).padStart(2, '0')}
            </span>
            <p style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
