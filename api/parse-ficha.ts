// Fase 5 — Función serverless de Vercel: recibe un PDF de ficha técnica,
// corre el pipeline de extracción (Fases 3-4) y el cálculo teórico
// (Fase 2), y devuelve el resultado. Se ejecuta en servidor para que el
// resultado sea idéntico sin importar el equipo del usuario que cotiza.
//
// Placeholder de la Fase 0 — implementación real en la Fase 5.

export default function handler(
  _req: unknown,
  res: {
    status: (code: number) => { json: (body: unknown) => void };
  },
) {
  res.status(501).json({
    error: "parse-ficha: pendiente de implementar en la Fase 5",
  });
}
