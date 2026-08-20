// Fase 4 — Extracción de áreas de tinta a partir de la geometría vectorial
// del PDF. Usa getOperatorList() para interpretar moveTo/lineTo/curveTo y
// calcula el área exacta de cada trazo con la fórmula de Shoelace.
//
// Placeholder de la Fase 0 — implementación real en la Fase 4.

export interface AreaTinta {
  color: string;
  areaCm2: number;
}

export async function extractInkAreas(
  _pdfBytes: ArrayBuffer,
): Promise<AreaTinta[]> {
  throw new Error("extractInkAreas: pendiente de implementar en la Fase 4");
}
