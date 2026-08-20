import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth/AuthContext";
import { supabase } from "../lib/supabase/client";

interface TablaCheck {
  tabla: string;
  ok: boolean;
  detalle: string;
}

export function DashboardPage() {
  const { user, rol, rolLoading, signOut } = useAuth();
  const [checks, setChecks] = useState<TablaCheck[] | null>(null);

  useEffect(() => {
    async function verificarTablas() {
      const tablas = ["tintas", "marcas", "ordenes_produccion", "consumos"];
      const resultados: TablaCheck[] = [];

      for (const tabla of tablas) {
        const { error, count } = await supabase
          .from(tabla)
          .select("*", { count: "exact", head: true });

        resultados.push({
          tabla,
          ok: !error,
          detalle: error ? error.message : `${count ?? 0} filas visibles`,
        });
      }

      setChecks(resultados);
    }

    verificarTablas();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm p-8 space-y-6">
        <div>
          <h1 className="text-lg font-bold text-[#1E2761] mb-1">
            Fase 0 — Verificación de infraestructura
          </h1>
          <p className="text-sm text-slate-500">
            Si ves tu correo, tu rol y las 4 tablas en verde, la Fase 0 está
            lista para pasar a la Fase 1.
          </p>
        </div>

        <dl className="space-y-1 text-sm">
          <div>
            <dt className="inline font-semibold">Usuario: </dt>
            <dd className="inline">{user?.email}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">ID (auth.uid): </dt>
            <dd className="inline font-mono text-xs">{user?.id}</dd>
          </div>
          <div>
            <dt className="inline font-semibold">Rol asignado: </dt>
            <dd className="inline">
              {rolLoading
                ? "cargando..."
                : (rol ??
                  "sin rol todavía — asígnalo en la tabla user_roles")}
            </dd>
          </div>
        </dl>

        <div>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">
            Conexión a tablas (RLS)
          </h2>
          {!checks && (
            <p className="text-sm text-slate-400">Consultando Supabase...</p>
          )}
          <ul className="space-y-1">
            {checks?.map((c) => (
              <li key={c.tabla} className="flex items-center gap-2 text-sm">
                <span
                  className={
                    c.ok
                      ? "inline-block w-2 h-2 rounded-full bg-emerald-500"
                      : "inline-block w-2 h-2 rounded-full bg-red-500"
                  }
                />
                <span className="font-mono">{c.tabla}</span>
                <span className="text-slate-400">— {c.detalle}</span>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={signOut}
          className="text-sm text-red-600 underline underline-offset-2"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
