import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, User, Mail, Lock } from 'lucide-react';
import { QyroLogo } from '../../../shared/components/ui/QyroLogo';
import { Button } from '../../../shared/components/ui/Button';
import { useAuthStore } from '../store/authStore';

interface RegisterViewProps {
  onBack: () => void;
  onSuccess: () => void;
}

export function RegisterView({ onBack, onSuccess }: RegisterViewProps) {
  const register = useAuthStore(s => s.register);

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;
    setLoading(true);
    setError('');
    const result = await register(name, email, password);
    setLoading(false);
    if (result.success) {
      onSuccess();
    } else {
      setError(result.error ?? 'Error al crear la cuenta');
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-void)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4" style={{ paddingTop: 'max(24px, var(--safe-top))' }}>
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] touch-compact"
        >
          <ArrowLeft size={18} />
        </button>
        <QyroLogo size={24} showText />
      </div>

      <div className="flex-1 px-6 pt-6">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1">Crear cuenta</h1>
        <p className="text-sm text-[var(--text-secondary)] mb-8">Empieza tu viaje con QYRO</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              Nombre
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre"
                autoComplete="name"
                required
                className="w-full h-12 pl-10 pr-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-lg)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                autoComplete="email"
                required
                className="w-full h-12 pl-10 pr-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-lg)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
              Contraseña
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type={showPw ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
                required
                minLength={6}
                className="w-full h-12 pl-10 pr-12 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-lg)] text-[var(--text-primary)] placeholder:text-[var(--text-placeholder)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] touch-compact"
                style={{ minHeight: 'unset' }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {password.length > 0 && password.length < 6 && (
              <p className="text-xs text-[var(--danger)]">Al menos 6 caracteres</p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-[var(--danger-subtle)] border border-[var(--danger)]/20 rounded-[var(--r-md)]">
              <p className="text-sm text-[var(--danger)]">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full mt-2"
            loading={loading}
            disabled={!name.trim() || !email.trim() || password.length < 6}
          >
            Crear cuenta
          </Button>
        </form>

        <p className="text-xs text-[var(--text-tertiary)] text-center mt-6 leading-relaxed">
          Al crear una cuenta aceptas los términos de uso. Todos tus datos se guardan localmente en tu dispositivo.
        </p>
      </div>
    </div>
  );
}
