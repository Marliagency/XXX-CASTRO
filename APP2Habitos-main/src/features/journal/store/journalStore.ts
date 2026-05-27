import { create } from 'zustand';
import { format, subDays, parseISO } from 'date-fns';
import type { JournalEntry, Mood } from '../types';
import { storage, STORAGE_KEYS } from '../../../shared/lib/storage';

const uid = () => crypto.randomUUID();
const now  = () => new Date().toISOString();

interface JournalState {
  entries: JournalEntry[];
  loaded:  boolean;

  loadFromStorage: () => Promise<void>;

  addEntry:    (data: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) => Promise<JournalEntry>;
  updateEntry: (id: string, patch: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  pinEntry:    (id: string, pinned: boolean) => Promise<void>;

  getEntryForDate:  (date: string) => JournalEntry | null;
  getEntriesInRange:(start: string, end: string) => JournalEntry[];
  getRecentEntries: (n: number) => JournalEntry[];
  getMoodByDate:    (date: string) => Mood | null;
  getStreakDays:    () => number;
  getAverageMood:   (days: number) => number | null;
  getMoodCalendar:  (days: number) => { date: string; mood: Mood | null }[];
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  loaded:  false,

  loadFromStorage: async () => {
    const entries = await storage.getItem<JournalEntry[]>(STORAGE_KEYS.journalEntries);
    set({ entries: entries ?? [], loaded: true });
  },

  addEntry: async (data) => {
    const entry: JournalEntry = {
      ...data,
      id:        uid(),
      createdAt: now(),
      updatedAt: now(),
      wordCount: data.content.trim().split(/\s+/).filter(Boolean).length,
      isPinned:  data.isPinned ?? false,
      tags:      data.tags ?? [],
    };
    const entries = [...get().entries, entry];
    set({ entries });
    await storage.setItem(STORAGE_KEYS.journalEntries, entries);
    return entry;
  },

  updateEntry: async (id, patch) => {
    const entries = get().entries.map(e =>
      e.id === id
        ? {
            ...e,
            ...patch,
            updatedAt: now(),
            wordCount: patch.content != null
              ? patch.content.trim().split(/\s+/).filter(Boolean).length
              : e.wordCount,
          }
        : e,
    );
    set({ entries });
    await storage.setItem(STORAGE_KEYS.journalEntries, entries);
  },

  deleteEntry: async (id) => {
    const entries = get().entries.filter(e => e.id !== id);
    set({ entries });
    await storage.setItem(STORAGE_KEYS.journalEntries, entries);
  },

  pinEntry: async (id, pinned) => {
    await get().updateEntry(id, { isPinned: pinned });
  },

  getEntryForDate: (date) =>
    get().entries.find(e => e.date === date) ?? null,

  getEntriesInRange: (start, end) =>
    get().entries.filter(e => e.date >= start && e.date <= end)
      .sort((a, b) => b.date.localeCompare(a.date)),

  getRecentEntries: (n) =>
    [...get().entries]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, n),

  getMoodByDate: (date) =>
    get().entries.find(e => e.date === date)?.mood ?? null,

  getStreakDays: () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const dateSet = new Set(get().entries.map(e => e.date));
    let streak = 0;
    let d = today;
    while (dateSet.has(d)) {
      streak++;
      d = format(subDays(parseISO(d), 1), 'yyyy-MM-dd');
    }
    return streak;
  },

  getAverageMood: (days) => {
    const cutoff = format(subDays(new Date(), days), 'yyyy-MM-dd');
    const withMood = get().entries.filter(e => e.date >= cutoff && e.mood != null);
    if (withMood.length === 0) return null;
    return withMood.reduce((sum, e) => sum + (e.mood ?? 0), 0) / withMood.length;
  },

  getMoodCalendar: (days) => {
    const result: { date: string; mood: Mood | null }[] = [];
    const dateMap = new Map(get().entries.map(e => [e.date, e.mood]));
    for (let i = days - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      result.push({ date, mood: dateMap.get(date) ?? null });
    }
    return result;
  },
}));
