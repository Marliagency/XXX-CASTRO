import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { useHabitsStore } from '../../habits/store/habitsStore';
import { useWorkoutsStore } from '../../workouts/store/workoutsStore';
import { useGoalsStore } from '../../goals/store/goalsStore';
import { useJournalStore } from '../../journal/store/journalStore';
import { INTENT_LABELS } from '../../goals/types';
import { fmt } from '../../../shared/utils/fmt';

export interface Achievement {
  id: string;
  emoji: string;
  color: string;
  title: string;
  description: string;
  progressPct: number;
  dateLabel: string;
  route: string;
}

function calcStreak(habitId: string, entries: { habitId: string; date: string; count: number }[]): number {
  const completed = [...new Set(
    entries.filter(e => e.habitId === habitId && e.count > 0).map(e => e.date)
  )].sort().reverse();

  let streak = 0;
  for (let i = 0; i < completed.length; i++) {
    const expected = new Date();
    expected.setDate(expected.getDate() - i);
    if (completed[i] === format(expected, 'yyyy-MM-dd')) streak++;
    else break;
  }
  return streak;
}

export function useAchievements(): Achievement[] {
  const { habits, entries } = useHabitsStore();
  const { workouts }        = useWorkoutsStore();
  const { goal }            = useGoalsStore();
  const { entries: journalEntries, getStreakDays } = useJournalStore();

  return useMemo(() => {
    const list: Achievement[] = [];

    // ── Habit streaks ─────────────────────────────────────────────────────────
    habits.filter(h => !h.archivedAt).forEach(h => {
      const streak = calcStreak(h.id, entries);
      const milestones = [
        { days: 100, emoji: '🏆', color: '#ff9500', pct: 100 },
        { days: 30,  emoji: '🥇', color: '#ff9500', pct: Math.min(100, Number((streak / 30 * 100).toFixed(2))) },
        { days: 7,   emoji: '🔥', color: '#ff3b30', pct: Math.min(100, Number((streak / 7 * 100).toFixed(2))) },
      ];
      for (const m of milestones) {
        if (streak >= m.days) {
          list.push({
            id: `streak_${m.days}_${h.id}`,
            emoji: m.emoji,
            color: m.color,
            title: `${m.days} días: ${h.name}`,
            description: `Racha actual de ${streak} días consecutivos`,
            progressPct: m.pct,
            dateLabel: 'En progreso',
            route: '/habits',
          });
          break;
        } else if (streak > 0 && m.days === 7) {
          list.push({
            id: `streak_7_${h.id}`,
            emoji: '⚡',
            color: '#007aff',
            title: `${h.emoji} ${h.name}`,
            description: `Racha de ${streak} día${streak > 1 ? 's' : ''}`,
            progressPct: Number((streak / 7 * 100).toFixed(2)),
            dateLabel: `${streak}/7 días`,
            route: '/habits',
          });
          break;
        }
      }
    });

    // ── PRs de entrenamiento ──────────────────────────────────────────────────
    workouts.forEach(w => {
      w.prs.forEach(pr => {
        list.push({
          id: `pr_${pr.exerciseId}_${w.date}`,
          emoji: '💪',
          color: '#ff3b30',
          title: `PR: ${pr.exerciseId.replace(/_/g, ' ')}`,
          description: `${fmt(pr.value, { decimals: 2 })} kg — nuevo máximo`,
          progressPct: 100,
          dateLabel: format(parseISO(w.date + 'T12:00:00'), "d MMM", { locale: es }),
          route: '/workouts',
        });
      });
    });

    // ── Journal streak ────────────────────────────────────────────────────────
    const journalStreak = getStreakDays();
    if (journalStreak >= 7) {
      list.push({
        id: 'journal_streak',
        emoji: '📖',
        color: '#af52de',
        title: `Diario: ${journalStreak} días seguidos`,
        description: 'Reflexión diaria consecutiva',
        progressPct: Math.min(100, Number((journalStreak / 30 * 100).toFixed(2))),
        dateLabel: 'En progreso',
        route: '/journal',
      });
    }

    // ── Objetivo activo ───────────────────────────────────────────────────────
    if (goal) {
      const today = format(new Date(), 'yyyy-MM-dd');
      const cutoff = format(new Date(Date.now() - 7 * 86400000), 'yyyy-MM-dd');
      const habitsThisWeek = entries.filter(e => e.date >= cutoff && e.date <= today && e.count > 0).length;
      const maxPossible = habits.filter(h => !h.archivedAt).length * 7;
      const pct = maxPossible > 0 ? Number((habitsThisWeek / maxPossible * 100).toFixed(2)) : 0;
      list.push({
        id: `goal_${goal.intent}`,
        emoji: '🎯',
        color: '#5856d6',
        title: `Objetivo: ${INTENT_LABELS[goal.intent]}`,
        description: goal.derived.weeklyGoalSummary.slice(0, 70),
        progressPct: pct,
        dateLabel: `${fmt(pct, { decimals: 1 })}% esta semana`,
        route: '/goals',
      });
    }

    return list
      .sort((a, b) => b.progressPct - a.progressPct)
      .slice(0, 10);
  }, [habits, entries, workouts, goal, journalEntries, getStreakDays]);
}
