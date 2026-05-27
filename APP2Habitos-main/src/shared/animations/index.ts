// src/shared/animations/index.ts
// Biblioteca de animaciones reutilizables de QYRO
// Inspiradas en el estilo fluido de apps nativas iOS/Android

import type { Variants, Transition } from 'framer-motion';

// ─── Transiciones base ────────────────────────────────────────────────────────

export const spring: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
};

export const springGentle: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 25,
};

export const springBouncy: Transition = {
  type: 'spring',
  stiffness: 500,
  damping: 28,
};

export const easeBase: Transition = {
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

export const easeFast: Transition = {
  duration: 0.15,
  ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
};

// ─── Variantes de página ──────────────────────────────────────────────────────

export const pageVariants: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { ...easeBase, duration: 0.25 } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

// ─── Variantes de lista con stagger ─────────────────────────────────────────

export const listContainerVariants: Variants = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

export const listItemVariants: Variants = {
  initial: { opacity: 0, y: 16, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1, transition: springGentle },
  exit:    { opacity: 0, x: -20, scale: 0.95, transition: easeFast },
};

// ─── Card ─────────────────────────────────────────────────────────────────────

export const cardVariants: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: springGentle },
  hover:   { scale: 1.01, transition: { duration: 0.15 } },
  tap:     { scale: 0.98, transition: { duration: 0.08 } },
};

// ─── Check / completado ───────────────────────────────────────────────────────

export const checkmarkVariants: Variants = {
  hidden:  { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut', delay: 0.05 },
  },
};

// ─── Slide desde abajo (sheets) ───────────────────────────────────────────────

export const slideUpVariants: Variants = {
  hidden:  { y: '100%', opacity: 0 },
  visible: { y: 0, opacity: 1, transition: springGentle },
  exit:    { y: '100%', opacity: 0, transition: { duration: 0.2 } },
};

// ─── Fade simple ──────────────────────────────────────────────────────────────

export const fadeVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: easeBase },
  exit:    { opacity: 0, transition: { duration: 0.12 } },
};

// ─── Streak / fire ───────────────────────────────────────────────────────────

export const streakVariants: Variants = {
  idle:  { scale: 1, rotate: 0 },
  pulse: {
    scale: [1, 1.15, 1],
    rotate: [-3, 3, -3, 0],
    transition: { duration: 0.6, repeat: Infinity, repeatDelay: 2 },
  },
};

// ─── Overlay ─────────────────────────────────────────────────────────────────

export const overlayVariants: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
};
