import { useEffect, useRef } from 'react';
import { useMotionValue, useSpring } from 'framer-motion';
import { fmt } from '../../utils/fmt';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  unit?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function AnimatedNumber({
  value,
  decimals = 0,
  unit,
  style,
  className,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 200, damping: 25 });
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    motionValue.set(value);
  }, [value, motionValue]);

  useEffect(() => {
    return springValue.on('change', (latest) => {
      if (ref.current) {
        ref.current.textContent =
          fmt(latest, { decimals: Math.min(decimals, 2) }) + (unit ? ` ${unit}` : '');
      }
    });
  }, [springValue, decimals, unit]);

  return (
    <span
      ref={ref}
      style={{ fontFamily: 'var(--font-mono)', ...style }}
      className={className}
    >
      {fmt(value, { decimals: Math.min(decimals, 2) })}{unit ? ` ${unit}` : ''}
    </span>
  );
}
