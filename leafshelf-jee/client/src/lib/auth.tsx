import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from './types';
import * as apiClient from './api';

type AuthState = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (name: string, email: string, password: string) => Promise<User>;
  signInLocal: (email: string, name?: string) => User;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthCtx = createContext<AuthState | undefined>(undefined);
const AUTH_USER_CACHE_KEY = 'auth:user';
const LOCAL_SESSION_KEY = 'leafshelf:local-session';

function readCachedUser(): User | null {
  return apiClient.readCached<User>(AUTH_USER_CACHE_KEY);
}

function readLocalSession(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch { return null; }
}

function writeLocalSession(u: User) {
  try { window.localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(u)); } catch { /* ignore */ }
}

function clearLocalSession() {
  try { window.localStorage.removeItem(LOCAL_SESSION_KEY); } catch { /* ignore */ }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readLocalSession() ?? readCachedUser());
  const [loading, setLoading] = useState(() => !(readLocalSession() ?? readCachedUser()));

  const refresh = useCallback(async () => {
    const local = readLocalSession();
    if (local) {
      setUser(local);
      apiClient.writeCached(AUTH_USER_CACHE_KEY, local);
      setLoading(false);
      return;
    }
    try {
      const u = await apiClient.me();
      setUser(u);
      apiClient.writeCached(AUTH_USER_CACHE_KEY, u);
    } catch (error) {
      if (apiClient.isUnauthorizedError(error)) {
        setUser(null);
        apiClient.clearCached(AUTH_USER_CACHE_KEY);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const u = await apiClient.login({ email, password });
    setUser(u);
    apiClient.writeCached(AUTH_USER_CACHE_KEY, u);
    return u;
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const u = await apiClient.register({ name, email, password });
    setUser(u);
    apiClient.writeCached(AUTH_USER_CACHE_KEY, u);
    return u;
  }, []);

  const signInLocal = useCallback((email: string, name?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const derivedName = name?.trim() || cleanEmail.split('@')[0]?.replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Reader';
    const u: User = {
      id: Math.floor(Math.random() * 100000) + 1000,
      name: derivedName,
      email: cleanEmail,
      is_admin: false,
      created_at: new Date().toISOString(),
    };
    setUser(u);
    apiClient.writeCached(AUTH_USER_CACHE_KEY, u);
    writeLocalSession(u);
    return u;
  }, []);

  const signOut = useCallback(async () => {
    try { await apiClient.logout(); } catch { /* ignore */ }
    setUser(null);
    apiClient.clearCached(AUTH_USER_CACHE_KEY);
    clearLocalSession();
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, signIn, signUp, signInLocal, signOut, refresh }),
    [user, loading, signIn, signUp, signInLocal, signOut, refresh]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
