import { motion } from 'framer-motion';
import { pageVariants } from '../../animations';

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedPage({ children, className }: AnimatedPageProps) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ height: '100%', minHeight: '100%' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
