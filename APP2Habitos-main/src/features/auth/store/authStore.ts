import { create } from 'zustand';
import { storage, STORAGE_KEYS } from '../../../shared/lib/storage';
import type { UserProfile } from '../../user/types';

const AUTH_KEY = 'auth.session.v1';
const USERS_KEY = 'auth.users.v1';

interface StoredUser {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

interface AuthSession {
  userId: string;
  email: string;
  loggedInAt: string;
}

interface AuthState {
  session: AuthSession | null;
  loaded: boolean;

  loadFromStorage: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'qyro_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const uid = () => crypto.randomUUID();

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  loaded: false,

  loadFromStorage: async () => {
    const session = await storage.getItem<AuthSession>(AUTH_KEY);
    set({ session, loaded: true });
  },

  register: async (name, email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    const users = (await storage.getItem<StoredUser[]>(USERS_KEY)) ?? [];
    const existing = users.find(u => u.email === normalizedEmail);
    if (existing) {
      return { success: false, error: 'Ya existe una cuenta con ese correo' };
    }

    if (password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    const passwordHash = await hashPassword(password);
    const userId = uid();
    const now = new Date().toISOString();

    const newUser: StoredUser = { id: userId, email: normalizedEmail, passwordHash, createdAt: now };
    await storage.setItem(USERS_KEY, [...users, newUser]);

    const profile: UserProfile = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      avatarUrl: null,
      birthDate: null,
      sex: null,
      heightCm: null,
      weightKg: null,
      targetWeightKg: null,
      activityLevel: null,
      goal: null,
      enabledFeatures: { habits: true, workouts: true, nutrition: true, journal: true, tasks: true },
      createdAt: now,
      onboardingCompleted: false,
      onboardingStep: 0,
    };
    await storage.setItem(STORAGE_KEYS.userProfile, profile);

    const session: AuthSession = { userId, email: normalizedEmail, loggedInAt: now };
    await storage.setItem(AUTH_KEY, session);
    set({ session });

    return { success: true };
  },

  login: async (email, password) => {
    const normalizedEmail = email.toLowerCase().trim();
    const users = (await storage.getItem<StoredUser[]>(USERS_KEY)) ?? [];
    const user = users.find(u => u.email === normalizedEmail);
    if (!user) {
      return { success: false, error: 'No existe una cuenta con ese correo' };
    }

    const passwordHash = await hashPassword(password);
    if (passwordHash !== user.passwordHash) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    const session: AuthSession = { userId: user.id, email: normalizedEmail, loggedInAt: new Date().toISOString() };
    await storage.setItem(AUTH_KEY, session);
    set({ session });

    return { success: true };
  },

  logout: async () => {
    await storage.removeItem(AUTH_KEY);
    set({ session: null });
  },

  isAuthenticated: () => get().session !== null,
}));
