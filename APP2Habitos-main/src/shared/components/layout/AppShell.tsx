import { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { useUserStore } from '../../../features/user/store/userStore';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  useTheme();
  const { loaded, loadFromStorage } = useUserStore();
  useEffect(() => { if (!loaded) loadFromStorage(); }, [loaded, loadFromStorage]);

  return (
    <div className="flex h-[100dvh] bg-[var(--bg-void)] overflow-hidden">
      <aside className="hidden md:flex w-60 shrink-0">
        <Sidebar />
      </aside>
      <main className="app-main-scroll">
        <div className="pb-20 md:pb-6">
          {children}
        </div>
      </main>
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-40">
        <BottomNav />
      </div>
    </div>
  );
}
