import { useEffect } from 'react';
import { QyroLogo } from '../../../shared/components/ui/QyroLogo';

interface SplashViewProps {
  onDone: () => void;
}

export function SplashView({ onDone }: SplashViewProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 1800);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6"
      style={{ background: 'var(--qyro-grad)' }}
    >
      {/* Animated logo */}
      <div className="flex flex-col items-center gap-4 animate-[fadeInUp_0.6s_ease_both]">
        <div className="w-24 h-24 bg-white/15 rounded-[28px] flex items-center justify-center shadow-2xl">
          <QyroLogo size={56} />
        </div>
        <span className="text-4xl font-extrabold tracking-tight text-white">QYRO</span>
        <p className="text-white/70 text-sm font-medium tracking-wide">Tu sistema operativo personal</p>
      </div>

      {/* Loading dots */}
      <div className="flex gap-1.5 mt-8">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-white/50 animate-bounce"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
