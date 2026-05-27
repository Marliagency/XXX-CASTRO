import { forwardRef, type TextareaHTMLAttributes } from 'react';
import clsx from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={clsx(
            'w-full min-h-[80px] bg-[var(--bg-surface)] text-[var(--text-primary)]',
            'border border-[var(--border-default)] rounded-[var(--r-md)]',
            'px-3 py-2 text-sm placeholder:text-[var(--text-placeholder)]',
            'transition-all duration-150 resize-y',
            'focus:outline-none focus:border-[var(--border-focus)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'text-base', // prevents iOS zoom
            error ? 'border-[var(--danger)]' : '',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-tertiary)]">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
