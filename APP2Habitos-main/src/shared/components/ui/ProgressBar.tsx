import clsx from 'clsx';

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  color?: string;
  size?: 'xs' | 'sm' | 'md';
  label?: string;
}

const sizeClasses = { xs: 'h-1', sm: 'h-1.5', md: 'h-2' };

export function ProgressBar({ value, className, color, size = 'sm', label }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-[var(--text-secondary)]">{label}</span>
          <span className="text-xs font-medium text-[var(--text-primary)]">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={clsx('w-full bg-[var(--neutral-100)] rounded-[var(--r-full)] overflow-hidden', sizeClasses[size])}>
        <div
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          className="h-full rounded-[var(--r-full)] transition-all duration-300"
          style={{
            width: `${clamped}%`,
            backgroundColor: color ?? 'var(--accent)',
          }}
        />
      </div>
    </div>
  );
}
