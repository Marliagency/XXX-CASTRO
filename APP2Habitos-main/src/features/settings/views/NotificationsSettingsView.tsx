import { useState, useEffect } from 'react';
import { Bell, BellOff, Clock, Zap } from 'lucide-react';
import { PageHeader } from '../../../shared/components/layout/PageHeader';
import { Toggle } from '../../../shared/components/ui';
import { useToast } from '../../../shared/components/ui';
import { storage } from '../../../shared/lib/storage';

const NOTIF_KEY = 'app.notifications.prefs';

interface NotifPrefs {
  enabled:        boolean;
  habitReminder:  boolean;
  habitTime:      string;
  workoutReminder: boolean;
  workoutTime:    string;
  nutritionReminder: boolean;
  nutritionTime:  string;
  weeklyReport:   boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  enabled:           false,
  habitReminder:     true,
  habitTime:         '08:00',
  workoutReminder:   true,
  workoutTime:       '07:00',
  nutritionReminder: false,
  nutritionTime:     '12:00',
  weeklyReport:      true,
};

function TimeInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <input
      type="time"
      value={value}
      onChange={e => onChange(e.target.value)}
      className="h-9 px-3 bg-[var(--bg-base)] border border-[var(--border-default)] rounded-[var(--r-md)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] transition-colors"
    />
  );
}

export default function NotificationsSettingsView() {
  const { toast }      = useToast();
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [permState, setPermState] = useState<NotificationPermission>('default');

  useEffect(() => {
    storage.getItem<NotifPrefs>(NOTIF_KEY).then(saved => {
      if (saved) setPrefs(saved);
    });
    if ('Notification' in window) {
      setPermState(Notification.permission);
    }
  }, []);

  const update = async (patch: Partial<NotifPrefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    await storage.setItem(NOTIF_KEY, next);
  };

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      toast('Tu navegador no soporta notificaciones', 'error');
      return;
    }
    const result = await Notification.requestPermission();
    setPermState(result);
    if (result === 'granted') {
      await update({ enabled: true });
      toast('Notificaciones activadas', 'success');
    } else {
      toast('Permiso denegado', 'error');
    }
  };

  const handleToggleEnabled = async (val: boolean) => {
    if (val && permState !== 'granted') {
      await requestPermission();
    } else {
      await update({ enabled: val });
    }
  };

  return (
    <div className="page-content pb-24">
      <PageHeader title="Notificaciones" backButton />

      <div className="space-y-6 mt-2">
        {/* Master toggle */}
        <div className="section-group">
          <div className="section-body px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {prefs.enabled
                  ? <Bell size={20} className="text-[var(--accent)]" />
                  : <BellOff size={20} className="text-[var(--text-tertiary)]" />
                }
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Notificaciones push</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {permState === 'denied'
                      ? 'Permiso denegado — actívalo en ajustes del sistema'
                      : permState === 'granted'
                      ? 'Permiso concedido'
                      : 'Se pedirá permiso al activar'}
                  </p>
                </div>
              </div>
              <Toggle
                checked={prefs.enabled && permState === 'granted'}
                onChange={handleToggleEnabled}
              />
            </div>
          </div>
        </div>

        {/* Reminder settings */}
        <div className="section-group" style={{ opacity: prefs.enabled ? 1 : 0.5, transition: 'opacity 0.2s' }}>
          <p className="section-header">Recordatorios</p>
          <div className="section-body divide-y divide-[var(--border-subtle)]">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[var(--c-habits)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Hábitos diarios</p>
                  <TimeInput
                    value={prefs.habitTime}
                    onChange={v => update({ habitTime: v })}
                  />
                </div>
              </div>
              <Toggle
                checked={prefs.habitReminder}
                onChange={v => update({ habitReminder: v })}
                disabled={!prefs.enabled}
              />
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[var(--c-workouts)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Entrenamiento</p>
                  <TimeInput
                    value={prefs.workoutTime}
                    onChange={v => update({ workoutTime: v })}
                  />
                </div>
              </div>
              <Toggle
                checked={prefs.workoutReminder}
                onChange={v => update({ workoutReminder: v })}
                disabled={!prefs.enabled}
              />
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-[var(--c-nutrition)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Nutrición</p>
                  <TimeInput
                    value={prefs.nutritionTime}
                    onChange={v => update({ nutritionTime: v })}
                  />
                </div>
              </div>
              <Toggle
                checked={prefs.nutritionReminder}
                onChange={v => update({ nutritionReminder: v })}
                disabled={!prefs.enabled}
              />
            </div>
          </div>
        </div>

        {/* Weekly report */}
        <div className="section-group" style={{ opacity: prefs.enabled ? 1 : 0.5, transition: 'opacity 0.2s' }}>
          <p className="section-header">Resúmenes</p>
          <div className="section-body px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap size={18} className="text-[var(--accent)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">Informe semanal</p>
                  <p className="text-xs text-[var(--text-secondary)]">Resumen de progreso cada domingo</p>
                </div>
              </div>
              <Toggle
                checked={prefs.weeklyReport}
                onChange={v => update({ weeklyReport: v })}
                disabled={!prefs.enabled}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
