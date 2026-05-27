/**
 * fmt — centralized number formatter. NEVER more than 2 decimal places.
 * Use this for every number displayed in the UI.
 */
export function fmt(
  value: number | null | undefined,
  options?: {
    decimals?: number;   // default 0 for integers, 2 for fractions — MAX 2
    unit?: string;       // 'kg', 'kcal', '%', 'g', etc.
    sign?: boolean;      // prefix + for positive
    compact?: boolean;   // 1234 → "1.2k"
    integer?: boolean;   // force 0 decimals (for calories etc.)
  },
): string {
  if (value === null || value === undefined || isNaN(value) || !isFinite(value)) return '—';

  const decimals = options?.integer ? 0 : Math.min(options?.decimals ?? 0, 2);
  const rounded = Number(value.toFixed(decimals));

  if (options?.compact && Math.abs(rounded) >= 1000) {
    const k = rounded / 1000;
    return k.toFixed(1) + 'k' + (options.unit ? ' ' + options.unit : '');
  }

  let str = rounded.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  if (options?.sign && rounded > 0) str = '+' + str;
  if (options?.unit) str += ' ' + options.unit;

  return str;
}

/** Short helpers for the most common cases */
export const fmtKcal  = (v: number | null | undefined) => fmt(v, { integer: true, unit: 'kcal' });
export const fmtKg    = (v: number | null | undefined) => fmt(v, { decimals: 2, unit: 'kg' });
export const fmtG     = (v: number | null | undefined) => fmt(v, { decimals: 1, unit: 'g' });
export const fmtPct   = (v: number | null | undefined) => fmt(v, { decimals: 1, unit: '%' });
export const fmtScore = (v: number | null | undefined) => fmt(v, { integer: true });
