import { createContext, useContext, type ReactNode } from 'react';
import clsx from 'clsx';

interface TabsContextValue {
  value: string;
  onChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

export function Tabs({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: ReactNode }) {
  return <TabsContext.Provider value={{ value, onChange }}>{children}</TabsContext.Provider>;
}

export function TabsList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div role="tablist" className={clsx('flex gap-0.5 p-1 bg-[var(--bg-base)] rounded-[var(--r-lg)]', className)}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className }: { value: string; children: ReactNode; className?: string }) {
  const ctx = useContext(TabsContext)!;
  const active = ctx.value === value;

  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={() => ctx.onChange(value)}
      className={clsx(
        'flex-1 px-3 py-1.5 text-sm font-medium rounded-[var(--r-md)] transition-all duration-150',
        active
          ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-xs)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children }: { value: string; children: ReactNode }) {
  const ctx = useContext(TabsContext)!;
  if (ctx.value !== value) return null;
  return <div role="tabpanel">{children}</div>;
}
