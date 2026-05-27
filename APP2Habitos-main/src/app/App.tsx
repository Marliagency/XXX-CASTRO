import { BrowserRouter } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Providers } from './providers';
import { AppShell } from '../shared/components/layout/AppShell';
import { AppRoutes } from './routes';
import { runMigrations } from '../shared/lib/migrations';
import { useAuthStore } from '../features/auth/store/authStore';
import { useUserStore } from '../features/user/store/userStore';
import { SplashView } from '../features/auth/views/SplashView';
import { WelcomeView } from '../features/auth/views/WelcomeView';
import { RegisterView } from '../features/auth/views/RegisterView';
import { LoginView } from '../features/auth/views/LoginView';
import { OnboardingView } from '../features/onboarding/views/OnboardingView';

type AuthScreen = 'splash' | 'welcome' | 'register' | 'login';

function AuthGate() {
  const { session, loaded: authLoaded, loadFromStorage: loadAuth } = useAuthStore();
  const { profile, loaded: userLoaded, loadFromStorage: loadUser } = useUserStore();
  const [screen, setScreen] = useState<AuthScreen>('splash');
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    runMigrations().catch(console.error);
    Promise.all([loadAuth(), loadUser()]);
  }, [loadAuth, loadUser]);

  // After splash, decide next screen
  const handleSplashDone = () => {
    setSplashDone(true);
  };

  if (!splashDone) {
    return <SplashView onDone={handleSplashDone} />;
  }

  // Still loading stores
  if (!authLoaded || !userLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'var(--qyro-grad)' }}>
        <div className="w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in
  if (!session) {
    if (screen === 'welcome') {
      return (
        <WelcomeView
          onRegister={() => setScreen('register')}
          onLogin={() => setScreen('login')}
        />
      );
    }
    if (screen === 'register') {
      return (
        <RegisterView
          onBack={() => setScreen('welcome')}
          onSuccess={() => {
            loadUser();
            // After register, onboarding will kick in automatically
          }}
        />
      );
    }
    if (screen === 'login') {
      return (
        <LoginView
          onBack={() => setScreen('welcome')}
          onSuccess={() => loadUser()}
        />
      );
    }
    // default: welcome
    return (
      <WelcomeView
        onRegister={() => setScreen('register')}
        onLogin={() => setScreen('login')}
      />
    );
  }

  // Session exists but profile hasn't loaded yet (e.g. right after register)
  if (!profile) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-void)]">
        <div className="w-7 h-7 border-2 border-[var(--border-default)] border-t-[var(--accent)] rounded-full animate-spin" />
      </div>
    );
  }

  // Logged in but onboarding not complete
  if (!profile.onboardingCompleted) {
    return <OnboardingView onComplete={() => loadUser()} />;
  }

  // Fully authenticated — show the main app
  return (
    <AppShell>
      <AppRoutes />
    </AppShell>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <Providers>
        <AuthGate />
      </Providers>
    </BrowserRouter>
  );
}
