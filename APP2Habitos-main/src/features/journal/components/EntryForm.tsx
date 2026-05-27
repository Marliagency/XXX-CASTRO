import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button, Input, Textarea } from '../../../shared/components/ui';
import { MoodPicker } from './MoodPicker';
import { TAG_LABELS, AI_PROMPTS_BY_MOOD, DAILY_PROMPTS } from '../types';
import type { Mood, JournalTag, JournalEntry } from '../types';

interface EntryFormProps {
  initial?: JournalEntry | null;
  defaultDate?: string;
  onSave: (data: {
    date: string;
    title?: string;
    content: string;
    mood: Mood | null;
    energy: number | null;
    tags: JournalTag[];
    isPinned: boolean;
  }) => void;
  onCancel: () => void;
  saving?: boolean;
}

const ALL_TAGS = Object.entries(TAG_LABELS) as [JournalTag, string][];

export function EntryForm({ initial, defaultDate, onSave, onCancel, saving = false }: EntryFormProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [date, setDate] = useState(initial?.date ?? defaultDate ?? today);
  const [title, setTitle] = useState(initial?.title ?? '');
  const [content, setContent] = useState(initial?.content ?? '');
  const [mood, setMood] = useState<Mood | null>(initial?.mood ?? null);
  const [energy, setEnergy] = useState<number | null>(initial?.energy ?? null);
  const [tags, setTags] = useState<JournalTag[]>(initial?.tags ?? []);
  const [showPrompts, setShowPrompts] = useState(false);
  const [aiPrompts, setAiPrompts] = useState<string[]>([]);

  // Generate AI prompts based on mood
  useEffect(() => {
    if (mood) {
      const moodPrompts = AI_PROMPTS_BY_MOOD[mood] ?? [];
      const daily = DAILY_PROMPTS[Math.floor(Math.random() * DAILY_PROMPTS.length)];
      setAiPrompts([...moodPrompts.slice(0, 2), daily]);
    } else {
      const daily = DAILY_PROMPTS.slice(0, 3);
      setAiPrompts(daily);
    }
  }, [mood]);

  const toggleTag = (tag: JournalTag) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const injectPrompt = (prompt: string) => {
    setContent(prev =>
      prev
        ? `${prev}\n\n**${prompt}**\n`
        : `**${prompt}**\n`
    );
    setShowPrompts(false);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSave({ date, title: title.trim() || undefined, content: content.trim(), mood, energy, tags, isPinned: initial?.isPinned ?? false });
  };

  return (
    <div className="space-y-4">
      {/* Date */}
      <div>
        <label className="text-xs text-[var(--text-tertiary)] mb-1 block">Fecha</label>
        <Input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          max={today}
        />
      </div>

      {/* Title (optional) */}
      <Input
        placeholder="Título (opcional)"
        value={title}
        onChange={e => setTitle(e.target.value)}
      />

      {/* Mood */}
      <div>
        <label className="text-xs text-[var(--text-tertiary)] mb-2 block">Estado de ánimo</label>
        <MoodPicker value={mood} onChange={setMood} size="md" />
      </div>

      {/* Energy */}
      <div>
        <label className="text-xs text-[var(--text-tertiary)] mb-2 block">
          Energía {energy ? `${energy}/5` : ''}
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setEnergy(energy === n ? null : n)}
              aria-label={`Energía ${n}`}
              className={`flex-1 py-1.5 rounded-[var(--r-md)] text-xs font-medium transition-all ${
                energy === n
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-base)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* AI Prompts */}
      <div className="rounded-[var(--r-lg)] border border-[var(--border-subtle)] overflow-hidden">
        <button
          onClick={() => setShowPrompts(p => !p)}
          className="w-full flex items-center justify-between px-3 py-2.5 bg-[var(--bg-base)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Sparkles size={12} className="text-[var(--accent)]" />
            <span>Preguntas de reflexión</span>
          </div>
          {showPrompts ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {showPrompts && (
          <div className="p-2 space-y-1.5">
            {aiPrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => injectPrompt(prompt)}
                className="w-full text-left px-3 py-2 rounded-[var(--r-md)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <label className="text-xs text-[var(--text-tertiary)] mb-1 block">
          Entrada {content.trim() ? `· ${content.trim().split(/\s+/).filter(Boolean).length} palabras` : ''}
        </label>
        <Textarea
          placeholder="¿Qué está pasando hoy? ¿Cómo te sientes?"
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={7}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="text-xs text-[var(--text-tertiary)] mb-2 block">Etiquetas</label>
        <div className="flex flex-wrap gap-1.5">
          {ALL_TAGS.map(([tag, label]) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                tags.includes(tag)
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-base)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button variant="ghost" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!content.trim() || saving}
          loading={saving}
          className="flex-1"
        >
          {initial ? 'Actualizar' : 'Guardar'}
        </Button>
      </div>
    </div>
  );
}
