import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  createElement,
  type ReactNode,
} from "react";
import { useLocation } from "@remix-run/react";
import { apiGet } from "~/lib/api.client";
import type { PublicUser } from "./authentication.types";
import { UserRole } from "./authentication.types";

export interface AuthState {
  user: PublicUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthState | null>(null);

function isAuthPath(pathname: string) {
  return pathname.startsWith("/auth") || pathname.startsWith("/accept-invite");
}

function fetchMe(setUser: (u: PublicUser | null) => void) {
  return apiGet<PublicUser>("/api/auth/me")
    .then((res) => setUser(res.success && res.data ? res.data : null))
    .catch(() => setUser(null));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const prevPathnameRef = useRef<string | null>(null);

  // Initial fetch
  useEffect(() => {
    fetchMe(setUser).finally(() => setLoading(false));
  }, []);

  // Re-fetch on every navigation so auth state stays in sync with the cookie
  // (covers login, logout, and session expiry — not just leaving auth pages)
  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = location.pathname;
    if (prev !== null && prev !== location.pathname) {
      fetchMe(setUser);
    }
  }, [location.pathname]);

  const value: AuthState = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === UserRole.Admin,
  };

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
