import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Technique {
  id:          string;
  title:       string;
  description: string;
  icon:        string;
  duration:    number | null;
}

const TECHNIQUES: Technique[] = [
  {
    id:       'delay',
    title:    'La regla de los 10 minutos',
    icon:     '⏱️',
    description:
      'Espera solo 10 minutos antes de ceder. Los antojos son olas — suben y bajan. En 10 minutos la intensidad habrá bajado un 70%.',
    duration: 600,
  },
  {
    id:       'breathing',
    title:    'Respiración 4-7-8',
    icon:     '🫁',
    description:
      'Inhala 4 seg → aguanta 7 seg → exhala 8 seg. Activa el sistema nervioso parasimpático y reduce el estrés en segundos.',
    duration: null,
  },
  {
    id:       'distraction',
    title:    'Interrupción de patrón',
    icon:     '🚶',
    description:
      'Cambia de lugar, llama a alguien, sal a caminar 5 minutos. El antojo está ligado al contexto — cambia el contexto y cambia el antojo.',
    duration: 300,
  },
  {
    id:       'surf',
    title:    'Surfear el antojo',
    icon:     '🏄',
    description:
      'No luches contra el antojo — obsérvalo. Nota dónde lo sientes en el cuerpo. Ponle un nombre. Los antojos que se observan sin juzgar se disuelven solos.',
    duration: null,
  },
];

interface CravingHelperProps {
  habitName: string;
}

export function CravingHelper({ habitName }: CravingHelperProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const selected = TECHNIQUES.find(t => t.id === selectedId);

  useEffect(() => {
    if (!timerActive || timeLeft <= 0) return;
    const id = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [timerActive, timeLeft]);

  const selectTechnique = (t: Technique) => {
    setSelectedId(t.id);
    if (t.duration) {
      setTimeLeft(t.duration);
      setTimerActive(true);
    } else {
      setTimerActive(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center py-2">
        <span style={{ fontSize: 40 }}>💪</span>
        <h3 className="text-xl font-bold mt-2">Puedes con esto</h3>
        <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
          Un antojo de <strong>{habitName}</strong> dura máximo 20 minutos.
          Elige una técnica:
        </p>
      </div>

      <div className="space-y-2">
        {TECHNIQUES.map(t => (
          <motion.button
            key={t.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => selectTechnique(t)}
            className="w-full flex items-start gap-3 p-4 rounded-[var(--r-xl)] text-left transition-colors"
            style={{
              background: selectedId === t.id ? 'var(--accent-subtle)' : 'var(--bg-base)',
              border: `1.5px solid ${selectedId === t.id ? 'var(--accent)' : 'var(--border-default)'}`,
            }}
          >
            <span style={{ fontSize: 26, flexShrink: 0, marginTop: 2 }}>{t.icon}</span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{t.title}</p>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                {t.description}
              </p>
              {t.duration && (
                <p className="text-xs font-semibold mt-2" style={{ color: 'var(--accent)' }}>
                  ⏱ {Math.floor(t.duration / 60)} minutos
                </p>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Timer activo */}
      <AnimatePresence>
        {timerActive && timeLeft > 0 && selected && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="p-5 rounded-[var(--r-xl)] text-center"
            style={{ background: 'var(--accent-subtle)', border: '1px solid var(--accent)' }}
          >
            <p className="text-sm text-[var(--text-secondary)] mb-2">Aguanta… el antojo está bajando</p>
            <p
              className="tabular"
              style={{
                fontSize: 48,
                fontWeight: 700,
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent)',
              }}
            >
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
              {String(timeLeft % 60).padStart(2, '0')}
            </p>
          </motion.div>
        )}

        {timerActive && timeLeft === 0 && (
          <motion.div
            key="done"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="p-6 rounded-[var(--r-xl)] text-center"
            style={{ background: 'var(--success-subtle)' }}
          >
            <span style={{ fontSize: 44 }}>🏆</span>
            <p className="text-lg font-bold mt-2" style={{ color: 'var(--success)' }}>
              ¡Lo superaste!
            </p>
            <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
              El antojo ha pasado. Cada vez que resistes, el siguiente será más fácil.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
