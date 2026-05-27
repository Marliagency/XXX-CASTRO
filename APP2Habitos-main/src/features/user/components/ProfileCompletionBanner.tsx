import { User, ChevronRight } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';

interface ProfileCompletionBannerProps {
  onComplete?: () => void;
}

export function ProfileCompletionBanner({ onComplete }: ProfileCompletionBannerProps) {
  const { isComplete, completionPct } = useUserProfile();

  if (isComplete) return null;

  return (
    <button
      onClick={onComplete}
      className="w-full flex items-center gap-3 p-4 rounded-[var(--r-xl)] border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] transition-colors text-left"
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
        style={{ background: 'var(--qyro-grad-soft)', border: '1px solid var(--border-default)' }}
      >
        <User size={18} style={{ color: 'var(--qyro-blue)' }} />
      </div>

      {/* Text + bar */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Completa tu perfil</p>
        <div className="flex items-center gap-2 mt-1.5">
          <div className="flex-1 h-1.5 bg-[var(--bg-sunken)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${completionPct ?? 0}%`, background: 'var(--qyro-grad)' }}
            />
          </div>
          <span className="text-xs font-semibold text-[var(--text-tertiary)] shrink-0">{completionPct ?? 0}%</span>
        </div>
        <p className="text-xs text-[var(--text-secondary)] mt-0.5">
          Activa estadísticas personalizadas y cálculo de calorías
        </p>
      </div>

      <ChevronRight size={16} className="text-[var(--text-tertiary)] shrink-0" />
    </button>
  );
}
