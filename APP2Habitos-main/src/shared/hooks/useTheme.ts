import { useEffect } from 'react';
import { useAppSettings } from './useAppSettings';

export function useTheme() {
  const { settings } = useAppSettings();

  useEffect(() => {
    const root = document.documentElement;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (settings.theme === 'dark' || (settings.theme === 'system' && prefersDark)) {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
  }, [settings.theme]);
}
