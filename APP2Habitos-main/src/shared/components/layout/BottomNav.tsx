import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Sun, Dumbbell, Apple, Target,
  CheckSquare, BookOpen, ListTodo, Bot, BarChart2, Settings,
  MoreHorizontal, X,
} from 'lucide-react';
import clsx from 'clsx';

const primaryItems: { to: string; icon: LucideIcon; label: string; end?: boolean }[] = [
  { to: '/',          icon: LayoutDashboard, label: 'Inicio', end: true },
  { to: '/today',     icon: Sun,             label: 'Hoy' },
  { to: '/workouts',  icon: Dumbbell,        label: 'Entrenos' },
  { to: '/nutrition', icon: Apple,           label: 'Nutrición' },
  { to: '/goals',     icon: Target,          label: 'Objetivos' },
];

const moreItems: { to: string; icon: LucideIcon; label: string; color: string }[] = [
  { to: '/habits',    icon: CheckSquare, label: 'Hábitos',     color: 'var(--c-habits)' },
  { to: '/journal',   icon: BookOpen,    label: 'Diario',      color: 'var(--c-journal)' },
  { to: '/tasks',     icon: ListTodo,    label: 'Tareas',      color: 'var(--c-tasks)' },
  { to: '/assistant', icon: Bot,         label: 'Asistente IA',color: 'var(--qyro-purple)' },
  { to: '/analytics', icon: BarChart2,   label: 'Analytics',   color: 'var(--qyro-teal)' },
  { to: '/settings',  icon: Settings,    label: 'Ajustes',     color: 'var(--text-secondary)' },
];

export function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {/* More drawer backdrop */}
      {moreOpen && (
        <div
          className="fixed inset-0 z-50"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(2px)' }}
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More drawer */}
      {moreOpen && (
        <div
          className="fixed left-0 right-0 z-50 bg-[var(--bg-surface)] rounded-t-[var(--r-2xl)] shadow-xl"
          style={{ bottom: 'calc(60px + env(safe-area-inset-bottom, 6px))' }}
        >
          {/* Handle */}
          <div className="w-10 h-1 bg-[var(--border-strong)] rounded-full mx-auto mt-3 mb-4" />
          <div className="grid grid-cols-3 gap-1 px-4 pb-4">
            {moreItems.map(({ to, icon: Icon, label, color }) => (
              <button
                key={to}
                onClick={() => { setMoreOpen(false); navigate(to); }}
                className="flex flex-col items-center gap-1.5 py-3 rounded-[var(--r-xl)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div
                  className="w-10 h-10 rounded-[var(--r-md)] flex items-center justify-center"
                  style={{ background: `${color}18` }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <span className="text-[11px] font-medium text-[var(--text-secondary)]">{label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main nav bar */}
      <nav
        className="flex items-end bg-[var(--bg-surface)]/95 backdrop-blur-xl border-t border-[var(--border-subtle)]"
        style={{ paddingBottom: 'max(var(--safe-bottom), 6px)' }}
      >
        {primaryItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1',
                'transition-all duration-150',
                isActive
                  ? 'text-[var(--accent)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.25 : 1.75} />
                  {isActive && (
                    <span
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                      style={{ background: 'var(--qyro-grad)' }}
                    />
                  )}
                </div>
                <span className="text-[9px] font-semibold tracking-wide uppercase mt-0.5">{label}</span>
              </>
            )}
          </NavLink>
        ))}

        {/* More button */}
        <button
          onClick={() => setMoreOpen(v => !v)}
          className={clsx(
            'flex-1 flex flex-col items-center justify-center gap-0.5 pt-2 pb-1',
            'transition-all duration-150',
            moreOpen ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
          )}
        >
          {moreOpen ? <X size={22} strokeWidth={2} /> : <MoreHorizontal size={22} strokeWidth={1.75} />}
          <span className="text-[9px] font-semibold tracking-wide uppercase mt-0.5">Más</span>
        </button>
      </nav>
    </>
  );
}
