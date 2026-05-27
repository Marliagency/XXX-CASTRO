import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BurstParticle {
  angle: number;
  distance: number;
}

const PARTICLES: BurstParticle[] = Array.from({ length: 8 }, (_, i) => ({
  angle:    (i / 8) * 360,
  distance: 22 + (i % 3) * 8,
}));

export function useCompletionBurst() {
  const [bursting, setBursting] = useState(false);

  const trigger = () => {
    setBursting(true);
    setTimeout(() => setBursting(false), 700);
  };

  return { bursting, trigger };
}

interface CompletionBurstProps {
  active: boolean;
  color?: string;
}

export function CompletionBurst({ active, color = 'var(--accent)' }: CompletionBurstProps) {
  return (
    <AnimatePresence>
      {active &&
        PARTICLES.map((p, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: color,
              top: '50%',
              left: '50%',
              pointerEvents: 'none',
              zIndex: 10,
            }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{
              x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
              y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
              opacity: 0,
              scale: 0,
            }}
            transition={{ duration: 0.55, ease: 'easeOut', delay: i * 0.02 }}
          />
        ))}
    </AnimatePresence>
  );
}
