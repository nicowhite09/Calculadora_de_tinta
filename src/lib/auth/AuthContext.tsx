import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../supabase/client";

export type Rol = "planta" | "produccion" | "administracion" | null;

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  rol: Rol;
  rolLoading: boolean;
  loading: boolean;
  signInWithMicrosoft: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [rol, setRol] = useState<Rol>(null);
  const [rolLoading, setRolLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      },
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setRol(null);
      return;
    }

    setRolLoading(true);
    supabase
      .from("user_roles")
      .select("rol")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error("No se pudo leer el rol del usuario:", error.message);
          setRol(null);
        } else {
          setRol((data?.rol as Rol) ?? null);
        }
        setRolLoading(false);
      });
  }, [session?.user?.id]);

  async function signInWithMicrosoft() {
    await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: {
        scopes: "email openid profile",
        redirectTo: window.location.origin,
      },
    });
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        rol,
        rolLoading,
        loading,
        signInWithMicrosoft,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
