import { motion, AnimatePresence } from 'framer-motion';
import { Timer, X } from 'lucide-react';
import { useRestTimer } from '../hooks/useRestTimer';
import { ProgressBar } from '../../../shared/components/ui';

interface RestTimerProps {
  defaultSeconds?: number;
}

export function RestTimer({ defaultSeconds = 90 }: RestTimerProps) {
  const { seconds, running, progress, start, stop } = useRestTimer(defaultSeconds);

  const presets = [30, 60, 90, 120, 180];

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Circular display */}
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--neutral-100)" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="44" fill="none"
            stroke={running ? 'var(--accent)' : 'var(--neutral-300)'}
            strokeWidth="8"
            strokeDasharray={`${2 * Math.PI * 44}`}
            strokeDashoffset={`${2 * Math.PI * 44 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-mono font-bold text-[var(--text-primary)]">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
          </span>
          {running && <span className="text-[10px] text-[var(--text-tertiary)]">restando</span>}
        </div>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-1.5">
        {presets.map(s => (
          <button
            key={s}
            onClick={() => start(s)}
            className={`px-2 py-1 text-xs rounded-[var(--r-sm)] border transition-colors ${
              running && seconds === s
                ? 'bg-[var(--accent)] text-white border-transparent'
                : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            {s}s
          </button>
        ))}
      </div>

      {/* Control */}
      <AnimatePresence>
        {running && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={stop}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[var(--text-secondary)] border border-[var(--border-default)] rounded-[var(--r-md)] hover:bg-[var(--bg-hover)] transition-colors"
          >
            <X size={12} /> Cancelar
          </motion.button>
        )}
        {!running && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => start()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-[var(--accent)] rounded-[var(--r-md)] hover:bg-[var(--accent-hover)] transition-colors"
          >
            <Timer size={12} /> Iniciar descanso
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

// Compact inline version shown after completing a set
interface InlineRestTimerProps {
  seconds: number;
  running: boolean;
  progress: number;
  onStop: () => void;
}

export function InlineRestTimer({ seconds, running, progress, onStop }: InlineRestTimerProps) {
  if (!running) return null;
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-[var(--accent-subtle)] border border-[var(--accent-border)] rounded-[var(--r-lg)]">
      <Timer size={14} className="text-[var(--accent)] shrink-0" />
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-[var(--accent)] font-medium">Descanso</span>
          <span className="font-mono text-[var(--accent)]">
            {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}
          </span>
        </div>
        <ProgressBar value={progress} color="var(--accent)" size="xs" />
      </div>
      <button onClick={onStop} className="text-[var(--accent)] hover:text-[var(--accent-hover)]">
        <X size={14} />
      </button>
    </div>
  );
}
