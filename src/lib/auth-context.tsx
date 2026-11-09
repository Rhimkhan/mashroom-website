"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "./supabase";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  authModalMode: "signin" | "signup";
  openAuthModal: (mode?: "signin" | "signup") => void;
  closeAuthModal: () => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ error: string | null; message?: string }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = "akhil_foods_auth_user_v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    let mounted = true;

    if (isSupabaseConfigured && supabase) {
      // 1. Get initial session from Supabase
      supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
        if (!mounted) return;
        if (!error && initialSession) {
          setSession(initialSession);
          setUser(initialSession.user);
        } else {
          // Check local simulated storage if any
          checkLocalFallback();
        }
        setLoading(false);
      }).catch(() => {
        if (mounted) {
          checkLocalFallback();
          setLoading(false);
        }
      });

      // 2. Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          try {
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(currentSession.user));
          } catch {
            // ignore
          }
        }
        setLoading(false);
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    } else {
      // Supabase not fully configured: use clean simulated local auth
      checkLocalFallback();
      setLoading(false);
    }

    function checkLocalFallback() {
      try {
        const raw = localStorage.getItem(LOCAL_USER_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          setUser(parsed);
        }
      } catch {
        // ignore
      }
    }
  }, []);

  const openAuthModal = (mode: "signin" | "signup" = "signin") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signInWithEmail = async (email: string, password: string): Promise<{ error: string | null }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { error: "Please provide both email and password." };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });
        if (error) {
          return { error: error.message };
        }
        setUser(data.user);
        setSession(data.session);
        try {
          localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
        } catch {
          // ignore
        }
        closeAuthModal();
        return { error: null };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "Authentication error occurred." };
      }
    }

    // Fallback simulated local sign-in
    const mockUser: User = {
      id: `usr_${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`,
      app_metadata: {},
      user_metadata: { full_name: cleanEmail.split("@")[0] },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: cleanEmail,
    } as User;

    setUser(mockUser);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    } catch {
      // ignore
    }
    closeAuthModal();
    return { error: null };
  };

  const signUpWithEmail = async (
    email: string,
    password: string,
    fullName?: string
  ): Promise<{ error: string | null; message?: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      return { error: "Please enter both email and password." };
    }
    if (password.length < 6) {
      return { error: "Password must be at least 6 characters long." };
    }

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: fullName?.trim() || cleanEmail.split("@")[0],
            },
          },
        });
        if (error) {
          return { error: error.message };
        }
        if (data.user) {
          setUser(data.user);
          setSession(data.session);
          try {
            localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(data.user));
          } catch {
            // ignore
          }
        }
        closeAuthModal();
        return {
          error: null,
          message: data.session ? "Account created successfully!" : "Please check your inbox to confirm your email.",
        };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "Registration failed." };
      }
    }

    // Fallback simulated sign-up
    const mockUser: User = {
      id: `usr_${Date.now()}`,
      app_metadata: {},
      user_metadata: { full_name: fullName?.trim() || cleanEmail.split("@")[0] },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: cleanEmail,
    } as User;

    setUser(mockUser);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    } catch {
      // ignore
    }
    closeAuthModal();
    return { error: null, message: "Welcome to Akhil Foods!" };
  };

  const signInWithGoogle = async (): Promise<{ error: string | null }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: `${origin}/account`,
          },
        });
        if (error) {
          return { error: error.message };
        }
        return { error: null };
      } catch (err: unknown) {
        return { error: err instanceof Error ? err.message : "Google authentication error." };
      }
    }

    // Fallback simulation for Google
    const mockUser: User = {
      id: `usr_google_${Date.now()}`,
      app_metadata: {},
      user_metadata: { full_name: "Google Customer" },
      aud: "authenticated",
      created_at: new Date().toISOString(),
      email: "customer@gmail.com",
    } as User;
    setUser(mockUser);
    try {
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(mockUser));
    } catch {
      // ignore
    }
    closeAuthModal();
    return { error: null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // ignore
      }
    }
    setUser(null);
    setSession(null);
    try {
      localStorage.removeItem(LOCAL_USER_KEY);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    } catch {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthModalOpen,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
