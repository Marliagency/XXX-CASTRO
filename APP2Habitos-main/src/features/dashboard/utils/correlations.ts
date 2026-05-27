export function pearsonCorrelation(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return 0;
  const meanX = xs.reduce((a, b) => a + b, 0) / n;
  const meanY = ys.reduce((a, b) => a + b, 0) / n;
  let num = 0, denX = 0, denY = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    num += dx * dy;
    denX += dx * dx;
    denY += dy * dy;
  }
  const den = Math.sqrt(denX * denY);
  return den === 0 ? 0 : Math.max(-1, Math.min(1, num / den));
}

export interface CorrelationInsight {
  label: string;
  r: number;
  insight: string;
}

export function buildInsights(
  habitScores: number[],
  workoutScores: number[],
): CorrelationInsight[] {
  const pairs: { label: string; xs: number[]; ys: number[]; positiveInsight: string; negativeInsight: string }[] = [
    {
      label: 'Hábitos ↔ Entrenos',
      xs: habitScores,
      ys: workoutScores,
      positiveInsight: 'Cuando completas más hábitos, también entrenas más.',
      negativeInsight: 'Los días que entrenas más, cumples menos hábitos.',
    },
  ];

  return pairs
    .map(p => {
      const r = pearsonCorrelation(p.xs, p.ys);
      return {
        label: p.label,
        r,
        insight: r >= 0 ? p.positiveInsight : p.negativeInsight,
      };
    })
    .filter(i => Math.abs(i.r) >= 0.2)
    .sort((a, b) => Math.abs(b.r) - Math.abs(a.r));
}
