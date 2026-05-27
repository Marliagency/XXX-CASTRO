import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pin, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { MoodDot } from './MoodPicker';
import { TAG_LABELS } from '../types';
import type { JournalEntry } from '../types';

interface EntryCardProps {
  entry: JournalEntry;
  onSelect: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
}

export function EntryCard({ entry, onSelect, onDelete, onPin }: EntryCardProps) {
  const preview = entry.content.slice(0, 120).trim();
  const hasMore = entry.content.length > 120;

  return (
    <div
      className="group bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-[var(--r-xl)] p-4 cursor-pointer hover:border-[var(--border-default)] transition-all"
      onClick={() => onSelect(entry)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          {entry.mood && <MoodDot mood={entry.mood} size={10} />}
          <span className="text-xs text-[var(--text-tertiary)] shrink-0">
            {format(parseISO(entry.date), "d 'de' MMMM", { locale: es })}
          </span>
          {entry.isPinned && (
            <Pin size={10} className="text-[var(--accent)] shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onPin(entry.id, !entry.isPinned); }}
            aria-label={entry.isPinned ? 'Desfijar entrada' : 'Fijar entrada'}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Pin size={12} className={clsx(entry.isPinned ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]')} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(entry.id); }}
            aria-label="Eliminar entrada"
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] transition-colors"
          >
            <Trash2 size={12} className="text-[var(--danger)]" />
          </button>
        </div>
      </div>

      {/* Title */}
      {entry.title && (
        <p className="text-sm font-semibold text-[var(--text-primary)] mb-1 truncate">{entry.title}</p>
      )}

      {/* Content preview */}
      <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
        {preview}{hasMore ? '…' : ''}
      </p>

      {/* Footer */}
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {entry.tags.slice(0, 3).map(tag => (
          <span
            key={tag}
            className="text-[9px] px-1.5 py-0.5 rounded-full bg-[var(--bg-base)] border border-[var(--border-subtle)] text-[var(--text-tertiary)]"
          >
            {TAG_LABELS[tag]}
          </span>
        ))}
        <span className="text-[9px] text-[var(--text-tertiary)] ml-auto">
          {entry.wordCount} palabras
        </span>
      </div>
    </div>
  );
}
