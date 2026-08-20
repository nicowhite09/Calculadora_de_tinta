// Fase 4 — Resolución del color real detrás de mallas de sombreado
// (shadingFill), necesario cuando el PDF fue exportado con transparencias
// aplanadas por Illustrator. Usa page.objs.get() para resolver el
// patrón/mesh y promediar el color de sus vértices.
//
// Placeholder de la Fase 0 — implementación real en la Fase 4.

export async function resolveShadingColor(
  _page: unknown,
  _shadingObjectId: string,
): Promise<{ r: number; g: number; b: number }> {
  throw new Error(
    "resolveShadingColor: pendiente de implementar en la Fase 4",
  );
}
