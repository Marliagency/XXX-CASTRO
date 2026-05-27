import { forwardRef, type InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconPosition = 'left', className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === 'left' && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full h-9 bg-[var(--bg-surface)] text-[var(--text-primary)]',
              'border border-[var(--border-default)] rounded-[var(--r-md)]',
              'text-sm placeholder:text-[var(--text-placeholder)]',
              'transition-all duration-150',
              'focus:outline-none focus:border-[var(--border-focus)] focus:ring-0',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              icon && iconPosition === 'left' ? 'pl-9 pr-3' : 'px-3',
              icon && iconPosition === 'right' ? 'pr-9' : '',
              error ? 'border-[var(--danger)] focus:border-[var(--danger)]' : '',
              'text-base', // prevents iOS zoom
              className
            )}
            {...props}
          />
          {icon && iconPosition === 'right' && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]">
              {icon}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-tertiary)]">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
