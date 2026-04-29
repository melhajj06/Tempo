"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type TempoAuthUser = {
  /** Optional display name typed at login. */
  label: string | null;
  /** Present when signed in via “Continue as guest”. */
  isGuest?: boolean;
};

type AuthContextValue = {
  user: TempoAuthUser | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TempoAuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me", { credentials: "include", cache: "no-store" });
      const data: { authenticated?: boolean; label?: string | null; guest?: boolean } =
        await response.json();
      if (data.authenticated === true) {
        setUser({ label: data.label ?? null, isGuest: data.guest === true });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void refreshSession().finally(() => setLoading(false));
  }, [refreshSession]);

  const value = useMemo(
    (): AuthContextValue => ({
      user,
      loading,
      refreshSession,
    }),
    [user, loading, refreshSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
