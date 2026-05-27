import { useState, useEffect, useRef, useCallback } from 'react';

export function useRestTimer(defaultSeconds = 90) {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [total, setTotal] = useState(defaultSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRunning(false);
    setSeconds(0);
  }, []);

  const start = useCallback((secs?: number) => {
    stop();
    if (secs != null) setTotal(secs);
    setSeconds(secs ?? total);
    setRunning(true);
  }, [stop, total]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setRunning(false);
          if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const progress = total > 0 ? ((total - seconds) / total) * 100 : 0;

  return { seconds, running, total, progress, start, stop };
}
