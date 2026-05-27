import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, CheckCircle2, Trash2, Info } from 'lucide-react';
import { PageHeader } from '../../../shared/components/layout/PageHeader';
import { Button } from '../../../shared/components/ui';
import { useToast } from '../../../shared/components/ui';

const AI_CLAUDE_KEY  = 'ai_claude_key';
const AI_OPENAI_KEY  = 'ai_openai_key';

function APIKeyField({ label, storageKey, placeholder, hint }: {
  label: string;
  storageKey: string;
  placeholder: string;
  hint?: string;
}) {
  const { toast }          = useToast();
  const [value, setValue]  = useState(() => localStorage.getItem(storageKey) ?? '');
  const [visible, setVis]  = useState(false);
  const [saved, setSaved]  = useState(() => !!localStorage.getItem(storageKey));

  useEffect(() => {
    const v = localStorage.getItem(storageKey) ?? '';
    setValue(v);
    setSaved(!!v);
  }, [storageKey]);

  const handleSave = () => {
    const trimmed = value.trim();
    if (trimmed) {
      localStorage.setItem(storageKey, trimmed);
      setSaved(true);
      toast(`Clave ${label} guardada`, 'success');
    } else {
      localStorage.removeItem(storageKey);
      setSaved(false);
      toast(`Clave ${label} eliminada`, 'info');
    }
  };

  const handleClear = () => {
    localStorage.removeItem(storageKey);
    setValue('');
    setSaved(false);
    toast(`Clave ${label} eliminada`, 'info');
  };

  const display = !visible && value.length > 8
    ? value.slice(0, 4) + '•'.repeat(Math.min(value.length - 8, 20)) + value.slice(-4)
    : value;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="label-caps text-[var(--text-tertiary)] flex-1">{label}</label>
        {saved && <CheckCircle2 size={14} className="text-green-500" />}
      </div>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type={visible ? 'text' : 'password'}
            value={display}
            onChange={e => { setValue(e.target.value); setSaved(false); }}
            placeholder={placeholder}
            className="w-full h-12 px-4 pr-11 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--r-lg)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors font-mono text-sm"
          />
          <button
            onClick={() => setVis(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] touch-compact"
            style={{ minHeight: 'unset' }}
          >
            {visible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} className="shrink-0">
          Guardar
        </Button>
        {saved && (
          <button
            onClick={handleClear}
            className="p-2 text-[var(--text-tertiary)] hover:text-red-500 transition-colors touch-compact"
            style={{ minHeight: 'unset' }}
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>
      {hint && (
        <p className="text-xs text-[var(--text-tertiary)] flex items-start gap-1.5">
          <Info size={12} className="mt-0.5 shrink-0" />
          {hint}
        </p>
      )}
    </div>
  );
}

export default function AISettingsView() {
  return (
    <div className="page-content pb-24">
      <PageHeader title="Asistente IA" backButton />

      <div className="space-y-6 mt-2">
        <div className="section-group">
          <p className="section-header">Claves de API</p>
          <p className="section-footer" style={{ paddingBottom: 8 }}>
            Tus claves se guardan solo en este dispositivo. Nunca se envían a nuestros servidores.
          </p>
          <div className="section-body px-4 py-4 space-y-5">
            <APIKeyField
              label="Claude (Anthropic)"
              storageKey={AI_CLAUDE_KEY}
              placeholder="sk-ant-api03-..."
              hint="Obtén tu clave en console.anthropic.com. Necesaria para usar el asistente con Claude."
            />
            <div className="border-t border-[var(--border-subtle)]" />
            <APIKeyField
              label="OpenAI"
              storageKey={AI_OPENAI_KEY}
              placeholder="sk-proj-..."
              hint="Obtén tu clave en platform.openai.com. Alternativa a Claude."
            />
          </div>
        </div>

        <div className="section-group">
          <p className="section-header">Información</p>
          <div className="section-body px-4 py-4 space-y-3">
            <div className="flex items-start gap-3">
              <Key size={18} className="text-[var(--accent)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Privacidad garantizada</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Las claves de API se almacenan únicamente en el almacenamiento local de tu navegador y solo se usan para hacer llamadas directamente a los servicios de IA.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Info size={18} className="text-[var(--accent)] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Modelo recomendado</p>
                <p className="text-xs text-[var(--text-secondary)] mt-0.5 leading-relaxed">
                  Usa claude-sonnet-4-6 o superior para mejores resultados con análisis de hábitos, nutrición y planificación de entrenamientos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
