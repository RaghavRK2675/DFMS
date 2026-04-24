import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { api, getToken, setToken } from "@/lib/api";

export interface UserPreferences {
  emailAlerts: boolean;
  pushAlerts: boolean;
  smsAlerts: boolean;
  criticalOnly: boolean;
  digestFrequency: "realtime" | "hourly" | "daily";
  theme: "light" | "dark" | "system";
}
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  farmName: string;
  location: string;
  phone: string;
  licenseId: string;
  preferences: UserPreferences;
  createdAt: string;
}

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; name: string; farmName?: string }) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: User) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string) => {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (payload: { email: string; password: string; name: string; farmName?: string }) => {
    const { data } = await api.post("/auth/signup", payload);
    setToken(data.token);
    setUser(data.user);
  };

  const loginWithGoogle = async (credential: string) => {
    const { data } = await api.post("/auth/google", { credential });
    setToken(data.token);
    setUser(data.user);
  };

  const logout = async () => {
    try { await api.post("/auth/logout"); } catch { /* ignore */ }
    setToken(null);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, signup, loginWithGoogle, logout, refresh, setUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}
