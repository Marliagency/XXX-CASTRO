import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../../shared/components/ui';
import { overlayVariants, slideUpVariants } from '../../../../shared/animations';

const COMMON_TRIGGERS = [
  'Estrés', 'Social', 'Aburrimiento', 'Ansiedad', 'Hábito automático', 'Otro',
];

interface RelapseModalProps {
  isOpen:    boolean;
  habitName: string;
  onConfirm: (note?: string, trigger?: string) => void;
  onCancel:  () => void;
}

export function RelapseModal({ isOpen, habitName, onConfirm, onCancel }: RelapseModalProps) {
  const [note, setNote]       = useState('');
  const [trigger, setTrigger] = useState('');

  const handleConfirm = () => {
    onConfirm(note.trim() || undefined, trigger || undefined);
    setNote('');
    setTrigger('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[200]"
            style={{ background: 'rgba(0,0,0,0.5)' }}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onCancel}
          />

          {/* Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[201] bg-[var(--bg-surface)] rounded-t-[var(--r-2xl)] overflow-y-auto"
            style={{
              maxHeight: '80dvh',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom, 24px))',
            }}
            variants={slideUpVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Handle */}
            <div className="w-9 h-1 bg-[var(--border-strong)] rounded-full mx-auto mt-3 mb-5" />

            <div className="px-5 space-y-5 pb-2">
              {/* Sin juicio */}
              <div className="text-center">
                <span style={{ fontSize: 40 }}>🤗</span>
                <h3 className="text-xl font-bold mt-2">Esto es parte del proceso</h3>
                <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                  Una recaída no borra tu progreso. El simple hecho de querer cambiar
                  ya te diferencia. Registremos esto para aprender de ello.
                </p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1 font-medium">
                  Hábito: <strong>{habitName}</strong>
                </p>
              </div>

              {/* Trigger */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3">
                  ¿Qué lo desencadenó? (opcional)
                </p>
                <div className="flex flex-wrap gap-2">
                  {COMMON_TRIGGERS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTrigger(trigger === t ? '' : t)}
                      className="px-3 py-1.5 rounded-[var(--r-full)] text-sm font-medium transition-colors"
                      style={{
                        border: `1.5px solid ${trigger === t ? 'var(--accent)' : 'var(--border-default)'}`,
                        background: trigger === t ? 'var(--accent-subtle)' : 'transparent',
                        color: trigger === t ? 'var(--accent)' : 'var(--text-secondary)',
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nota */}
              <div>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="¿Algo más que quieras anotar? (opcional)"
                  rows={3}
                  className="w-full px-4 py-3 rounded-[var(--r-lg)] text-[var(--text-primary)] resize-none focus:outline-none transition-colors"
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border-default)',
                    fontSize: 15,
                  }}
                />
              </div>

              {/* Botones */}
              <div className="space-y-2 pt-1">
                <Button
                  variant="danger"
                  size="lg"
                  className="w-full"
                  onClick={handleConfirm}
                >
                  Reiniciar contador
                </Button>
                <Button variant="ghost" size="lg" className="w-full" onClick={onCancel}>
                  Cancelar — seguir contando
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
