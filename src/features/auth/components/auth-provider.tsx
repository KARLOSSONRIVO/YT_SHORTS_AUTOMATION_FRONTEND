"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { login as loginRequest } from "../api/login";
import { register as registerRequest } from "../api/register";
import { AUTH_STORAGE_KEY, type AuthUser, type LoginInput, type RegisterInput } from "../types";

interface AuthContextValue {
  user: AuthUser | null;
  isReady: boolean;
  login: (input: LoginInput) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      const storedUser = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser) as Partial<AuthUser>;

        if (parsedUser.accessToken && parsedUser.id && parsedUser.email && parsedUser.displayName) {
          setUser(parsedUser as AuthUser);
        } else {
          window.localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
    } finally {
      setIsReady(true);
    }
  }, []);

  const persistUser = (nextUser: AuthUser) => {
    setUser(nextUser);
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
    return nextUser;
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isReady,
      login: async (input) => persistUser(await loginRequest(input)),
      register: async (input) => persistUser(await registerRequest(input)),
      logout: () => {
        setUser(null);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }),
    [isReady, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
