import { useState, useEffect } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, ReferenceLine,
} from 'recharts';
import { useNutritionStore } from '../../nutrition/store/nutritionStore';
import { Button, Modal } from '../../../shared/components/ui';
import { fmt, fmtKg } from '../../../shared/utils/fmt';
import { CHART_THEME, AppleTooltip } from '../../../shared/utils/chartTheme';

const COLOR = '#007aff';

export default function BodyMetricsView() {
  const { bodyWeight, logBodyWeight, deleteBodyWeight, loaded, loadFromStorage } = useNutritionStore();
  const [showAdd, setShowAdd] = useState(false);
  const [input, setInput]     = useState('');
  const [note, setNote]       = useState('');

  useEffect(() => { if (!loaded) loadFromStorage(); }, [loaded, loadFromStorage]);
  if (!loaded) return null;

  const sorted  = [...bodyWeight].sort((a, b) => a.date.localeCompare(b.date));
  const last    = sorted[sorted.length - 1];
  const prev    = sorted[sorted.length - 2];
  const diff    = last && prev ? Math.round((last.weight - prev.weight) * 100) / 100 : null;
  const totalDelta = sorted.length >= 2
    ? Math.round((sorted[sorted.length - 1].weight - sorted[0].weight) * 100) / 100
    : null;

  const chartData = sorted.slice(-60).map(b => ({
    label:  format(parseISO(b.date), 'd MMM', { locale: es }),
    weight: b.weight,
  }));

  const weights     = chartData.map(d => d.weight);
  const domainMin   = weights.length > 0 ? Math.min(...weights) - 1 : 0;
  const domainMax   = weights.length > 0 ? Math.max(...weights) + 1 : 100;
  const avgWeight   = weights.length > 0
    ? Math.round((weights.reduce((a, b) => a + b, 0) / weights.length) * 10) / 10
    : null;

  const handleSave = async () => {
    const w = parseFloat(input);
    if (!w || isNaN(w)) return;
    await logBodyWeight(w, note || undefined);
    setInput('');
    setNote('');
    setShowAdd(false);
  };

  const TrendIcon  = diff == null ? Minus : diff > 0 ? TrendingUp : TrendingDown;
  const trendColor = diff == null ? 'var(--text-tertiary)' : diff > 0 ? 'var(--danger)' : 'var(--success)';

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)]">Peso corporal</h1>
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{sorted.length} registros</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setShowAdd(true)}>
          Registrar
        </Button>
      </div>

      {/* Stats */}
      {last && (
        <div className="grid grid-cols-3 gap-3">
          <div className="metric-card text-center">
            <p className="text-[10px] text-[var(--text-tertiary)] mb-1">Actual</p>
            <p className="mono" style={{ fontSize: 24, fontWeight: 700, color: COLOR }}>{fmtKg(last.weight)}</p>
          </div>
          <div className="metric-card text-center">
            <p className="text-[10px] text-[var(--text-tertiary)] mb-1">vs anterior</p>
            <div className="flex items-center justify-center gap-1">
              <TrendIcon size={14} style={{ color: trendColor }} />
              <p className="mono" style={{ fontSize: 20, fontWeight: 700, color: trendColor }}>
                {diff != null ? `${diff > 0 ? '+' : ''}${fmt(diff, { decimals: 1 })}` : '—'}
              </p>
            </div>
            {diff != null && <p className="text-[10px] text-[var(--text-tertiary)]">kg</p>}
          </div>
          <div className="metric-card text-center">
            <p className="text-[10px] text-[var(--text-tertiary)] mb-1">Cambio total</p>
            <p className="mono" style={{ fontSize: 20, fontWeight: 700, color: totalDelta != null && totalDelta < 0 ? 'var(--success)' : totalDelta != null && totalDelta > 0 ? 'var(--danger)' : 'var(--text-primary)' }}>
              {totalDelta != null ? `${totalDelta > 0 ? '+' : ''}${fmt(totalDelta, { decimals: 1 })}` : '—'}
            </p>
            {totalDelta != null && <p className="text-[10px] text-[var(--text-tertiary)]">kg</p>}
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length >= 2 && (
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Evolución — últimos 60 días</span>
            {avgWeight !== null && (
              <span className="delta-pill delta-neutral">{fmtKg(avgWeight)} media</span>
            )}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLOR} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={COLOR} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...CHART_THEME.grid} />
              <XAxis dataKey="label" {...CHART_THEME.axis} interval="preserveStartEnd" />
              <YAxis {...CHART_THEME.axis} domain={[domainMin, domainMax]} tickFormatter={v => fmt(v, { integer: true })} width={32} />
              <Tooltip content={<AppleTooltip unit="kg" decimals={1} />} />
              {avgWeight && (
                <ReferenceLine y={avgWeight} stroke={COLOR} strokeDasharray="4 3" strokeWidth={1}
                  label={{ value: 'Media', position: 'insideTopRight', fontSize: 10, fill: COLOR }} />
              )}
              <Line type="monotone" dataKey="weight" stroke={COLOR} strokeWidth={2.5}
                dot={{ fill: COLOR, r: 3, strokeWidth: 0 }} name="Peso" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History list */}
      {sorted.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <TrendingUp size={28} className="mx-auto text-[var(--text-tertiary)]" />
          <p className="text-sm text-[var(--text-tertiary)]">Sin registros aún. Empieza a trackear tu peso.</p>
        </div>
      ) : (
        <div className="section-group">
          <p className="section-header">Historial</p>
          <div className="section-body">
            {[...sorted].reverse().slice(0, 25).map((b, i) => {
              const prevEntry = sorted.find(s => s.date < b.date);
              const d = prevEntry ? Math.round((b.weight - prevEntry.weight) * 100) / 100 : null;
              return (
                <div key={i} className="section-row">
                  <div className="section-row-content">
                    <div>
                      <span className="section-row-label">{fmtKg(b.weight)}</span>
                      {d != null && (
                        <span className="section-row-value" style={{ color: d > 0 ? 'var(--danger)' : 'var(--success)' }}>
                          {d > 0 ? '+' : ''}{fmt(d, { decimals: 1 })} kg
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[var(--text-tertiary)]">
                      {format(parseISO(b.date), "d 'de' MMMM yyyy", { locale: es })}
                      {b.note ? ` · ${b.note}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteBodyWeight(b.date)}
                    className="w-7 h-7 flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--danger)] transition-colors shrink-0"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Registrar peso">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)]">Peso (kg)</label>
            <input
              type="number" step="0.1" value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSave()}
              placeholder="75.5" autoFocus
              className="w-full h-9 px-3 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)]">Nota (opcional)</label>
            <input
              type="text" value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ayunas, por la mañana..."
              className="w-full h-9 px-3 text-sm bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)]"
            />
          </div>
          <Button variant="primary" size="md" className="w-full" onClick={handleSave} disabled={!input}>
            Guardar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
