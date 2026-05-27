import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backButton?: boolean;
  onBack?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, backButton, onBack, action, className = '' }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <div className={`page-header ${className}`}>
      <div className="flex-1 min-w-0">
        {backButton && (
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-[var(--accent)] text-sm font-medium mb-2 -ml-1 touch-compact"
            style={{ minHeight: 'unset' }}
          >
            <ChevronLeft size={18} />
            Atrás
          </button>
        )}
        <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
