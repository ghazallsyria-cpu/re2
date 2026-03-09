"use client";
import { useState, useEffect, createContext, useContext } from "react";
import { supabase } from "@/lib/supabase";
import type { AppUser } from "@/types";

type AuthContextType = {
  user: AppUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check stored session
    const stored = localStorage.getItem("rifa_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  }, []);

  const signOut = async () => {
    localStorage.removeItem("rifa_user");
    setUser(null);
    window.location.href = "/auth/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
