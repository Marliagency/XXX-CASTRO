import { forwardRef, type ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Spinner } from './Spinner';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'accent' | 'gradient';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantClasses: Record<ButtonVariant, string> = {
  gradient: [
    'text-white font-semibold',
    'border-0',
    'hover:opacity-90 active:opacity-80',
    'shadow-[var(--qyro-grad-glow)]',
  ].join(' '),
  primary: [
    'bg-[var(--neutral-900)] text-[var(--text-inverse)]',
    'hover:bg-[var(--neutral-800)] active:bg-[var(--neutral-950)]',
  ].join(' '),
  secondary: [
    'bg-[var(--bg-surface)] text-[var(--text-primary)]',
    'border border-[var(--border-default)]',
    'hover:bg-[var(--bg-hover)] active:bg-[var(--bg-selected)]',
  ].join(' '),
  ghost: [
    'bg-transparent text-[var(--text-secondary)]',
    'hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
    'active:bg-[var(--bg-selected)]',
  ].join(' '),
  danger: 'bg-[var(--danger)] text-white hover:opacity-90 active:opacity-80',
  accent: 'bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] active:opacity-90',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-[var(--r-sm)]',
  md: 'h-10 px-4 text-sm gap-2 rounded-[var(--r-md)]',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-[var(--r-lg)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'secondary', size = 'md', loading, icon, iconPosition = 'left', className, children, disabled, style, ...props }, ref) => {
    const isGradient = variant === 'gradient';

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={isGradient ? { background: 'var(--qyro-grad)', ...style } : style}
        className={clsx(
          'inline-flex items-center justify-center font-semibold transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'select-none cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Spinner size={size === 'sm' ? 'xs' : 'sm'} />
        ) : (
          iconPosition === 'left' && icon && <span className="shrink-0">{icon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && iconPosition === 'right' && icon && <span className="shrink-0">{icon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
