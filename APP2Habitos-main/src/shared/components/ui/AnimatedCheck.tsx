import { motion, AnimatePresence } from 'framer-motion';
import { checkmarkVariants, springBouncy } from '../../animations';

interface AnimatedCheckProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  color?: string;
  size?: number;
  disabled?: boolean;
}

export function AnimatedCheck({
  checked,
  onChange,
  color = 'var(--accent)',
  size = 26,
  disabled = false,
}: AnimatedCheckProps) {
  return (
    <motion.button
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      aria-pressed={checked}
      aria-label={checked ? 'Desmarcar' : 'Marcar como completado'}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        border: `2px solid ${checked ? color : 'var(--border-strong)'}`,
        background: checked ? color : 'transparent',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        padding: 0,
        outline: 'none',
        WebkitTapHighlightColor: 'transparent',
        minHeight: 'unset',
      }}
      animate={{
        scale: checked ? [1, 1.25, 1] : 1,
        borderColor: checked ? color : 'var(--border-strong)',
        backgroundColor: checked ? color : 'rgba(0,0,0,0)',
      }}
      transition={springBouncy}
      whileTap={disabled ? {} : { scale: 0.88 }}
    >
      <AnimatePresence>
        {checked && (
          <motion.svg
            width={size * 0.55}
            height={size * 0.55}
            viewBox="0 0 12 10"
            fill="none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
          >
            <motion.path
              d="M1 5L4.5 8.5L11 1.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              variants={checkmarkVariants}
              initial="hidden"
              animate="visible"
            />
          </motion.svg>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
