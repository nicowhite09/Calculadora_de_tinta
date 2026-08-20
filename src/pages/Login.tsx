import { Navigate } from "react-router-dom";
import { useAuth } from "../lib/auth/AuthContext";

export function LoginPage() {
  const { session, loading, signInWithMicrosoft } = useAuth();

  if (loading) return null;
  if (session) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="bg-white shadow-md rounded-xl p-10 w-full max-w-sm text-center">
        <h1 className="text-xl font-bold text-[#1E2761] mb-2">
          Calculadora de Tinta
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          Inicia sesión con tu cuenta corporativa de Microsoft.
        </p>
        <button
          onClick={signInWithMicrosoft}
          className="w-full bg-[#1E2761] text-white rounded-lg py-2.5 font-medium hover:opacity-90 transition-opacity"
        >
          Iniciar sesión con Microsoft
        </button>
      </div>
    </div>
  );
}
