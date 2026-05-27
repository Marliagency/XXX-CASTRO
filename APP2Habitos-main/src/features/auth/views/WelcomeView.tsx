import { QyroLogo } from '../../../shared/components/ui/QyroLogo';
import { Button } from '../../../shared/components/ui/Button';
import { CheckSquare, Dumbbell, Apple, BookOpen, Target } from 'lucide-react';

interface WelcomeViewProps {
  onRegister: () => void;
  onLogin: () => void;
}

const features = [
  { icon: CheckSquare, label: 'Hábitos',       color: 'var(--c-habits)' },
  { icon: Dumbbell,    label: 'Entrenamientos', color: 'var(--c-workouts)' },
  { icon: Apple,       label: 'Nutrición',      color: 'var(--c-nutrition)' },
  { icon: BookOpen,    label: 'Diario',          color: 'var(--c-journal)' },
  { icon: Target,      label: 'Objetivos',       color: 'var(--c-goals)' },
];

export function WelcomeView({ onRegister, onLogin }: WelcomeViewProps) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-void)]">
      {/* Hero gradient banner */}
      <div
        className="flex flex-col items-center justify-center pt-16 pb-12 px-6 text-center"
        style={{ background: 'var(--qyro-grad)' }}
      >
        <QyroLogo size={52} className="mb-4" />
        <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">QYRO</h1>
        <p className="text-white/80 text-base font-medium max-w-xs">
          Tu sistema operativo personal para una vida mejor
        </p>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-2 px-6 py-6">
        {features.map(({ icon: Icon, label, color }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm"
            style={{ color }}
          >
            <Icon size={13} />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Value props */}
      <div className="flex-1 px-6 space-y-3 pb-4">
        {[
          { emoji: '🎯', title: 'Todo en un lugar', desc: 'Hábitos, entrenos, nutrición y más unificados' },
          { emoji: '📊', title: 'Datos que importan', desc: 'Estadísticas personalizadas basadas en tu perfil' },
          { emoji: '🔒', title: '100% privado', desc: 'Todo se guarda en tu dispositivo, sin servidores' },
        ].map(({ emoji, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-3 p-4 bg-[var(--bg-surface)] rounded-[var(--r-xl)] border border-[var(--border-subtle)]"
          >
            <span className="text-xl">{emoji}</span>
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA buttons */}
      <div className="px-6 pb-8 space-y-3" style={{ paddingBottom: 'max(32px, calc(var(--safe-bottom) + 24px))' }}>
        <Button variant="gradient" size="lg" className="w-full" onClick={onRegister}>
          Crear cuenta gratis
        </Button>
        <Button variant="ghost" size="lg" className="w-full" onClick={onLogin}>
          Ya tengo cuenta — Iniciar sesión
        </Button>
      </div>
    </div>
  );
}
