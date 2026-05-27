import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  CheckSquare, Dumbbell, Apple, BookOpen, ListTodo,
  Bot, BarChart2, Settings, Home, LayoutDashboard, Target
} from 'lucide-react';
import clsx from 'clsx';
import { QyroLogo } from '../ui/QyroLogo';

const navItems: { to: string; icon: LucideIcon; label: string; color?: string; end?: boolean }[] = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/today', icon: Home, label: 'Hoy' },
  { to: '/habits', icon: CheckSquare, label: 'Hábitos', color: 'var(--c-habits)' },
  { to: '/workouts', icon: Dumbbell, label: 'Entrenamientos', color: 'var(--c-workouts)' },
  { to: '/nutrition', icon: Apple, label: 'Nutrición', color: 'var(--c-nutrition)' },
  { to: '/journal', icon: BookOpen, label: 'Diario', color: 'var(--c-journal)' },
  { to: '/tasks', icon: ListTodo, label: 'Tareas', color: 'var(--c-tasks)' },
  { to: '/goals', icon: Target, label: 'Objetivos', color: 'var(--c-goals)' },
];

const bottomItems: { to: string; icon: LucideIcon; label: string }[] = [
  { to: '/assistant', icon: Bot, label: 'Asistente IA' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
];

export function Sidebar() {
  return (
    <nav className="flex flex-col h-full w-full bg-[var(--bg-surface)] border-r border-[var(--border-subtle)]">
      {/* Brand header */}
      <div className="px-4 py-5 border-b border-[var(--border-subtle)]">
        <QyroLogo size={28} showText textSize="md" />
      </div>

      {/* Main nav */}
      <div className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label, color, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--r-md)] text-sm font-medium transition-all duration-150 min-h-[40px]',
                isActive
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={16}
                  style={{ color: isActive ? (color ?? 'var(--accent)') : undefined }}
                />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom items */}
      <div className="px-2 py-2 space-y-0.5 border-t border-[var(--border-subtle)]">
        {bottomItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--r-md)] text-sm font-medium transition-all duration-150 min-h-[40px]',
                isActive
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent)] font-semibold'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              )
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
