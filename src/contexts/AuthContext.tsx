import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import type { Session } from "@supabase/supabase-js";

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
  role: "farmer" | "admin";
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
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; name: string; farmName?: string }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: User) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const DEFAULT_PREFS: UserPreferences = {
  emailAlerts: true,
  pushAlerts: true,
  smsAlerts: false,
  criticalOnly: false,
  digestFrequency: "realtime",
  theme: "system",
};

async function loadProfile(session: Session): Promise<User> {
  const uid = session.user.id;
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", uid)
    .maybeSingle();
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", uid);

  const role: "farmer" | "admin" = roles?.some((r) => r.role === "admin") ? "admin" : "farmer";
  const meta = (session.user.user_metadata ?? {}) as Record<string, any>;

  return {
    id: uid,
    email: profile?.email ?? session.user.email ?? "",
    name: profile?.name || meta.name || meta.full_name || (session.user.email ?? "").split("@")[0],
    role,
    avatarUrl: profile?.avatar_url ?? meta.avatar_url ?? meta.picture,
    farmName: profile?.farm_name ?? "",
    location: profile?.location ?? "",
    phone: profile?.phone ?? "",
    licenseId: profile?.license_id ?? "",
    preferences: { ...DEFAULT_PREFS, ...((profile?.preferences as Partial<UserPreferences>) ?? {}) },
    createdAt: profile?.created_at ?? session.user.created_at ?? new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Set up listener BEFORE getting initial session (prevents race conditions).
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setUser(null);
        return;
      }
      // Defer profile load to avoid deadlock inside the auth callback.
      setTimeout(() => {
        loadProfile(newSession).then(setUser).catch(() => setUser(null));
      }, 0);
    });

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s) {
        loadProfile(s).then((u) => {
          setUser(u);
          setLoading(false);
        }).catch(() => {
          setUser(null);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const refresh = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (s) setUser(await loadProfile(s));
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signup = async (payload: { email: string; password: string; name: string; farmName?: string }) => {
    const redirectUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;
    const { error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name: payload.name, farm_name: payload.farmName ?? "" },
      },
    });
    if (error) throw error;
  };

  const loginWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}${import.meta.env.BASE_URL}`;
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: redirectUrl });
    if ((result as any)?.error) throw (result as any).error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <Ctx.Provider value={{ user, session, loading, login, signup, loginWithGoogle, logout, refresh, setUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>");
  return ctx;
}
