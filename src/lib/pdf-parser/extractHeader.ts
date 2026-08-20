// Fase 3 — Extracción de encabezado de la ficha técnica (cliente, referencia,
// material, manija, colores 1-8, tipo de Pantone) usando pdfjs-dist
// getTextContent(). Sin OCR ni visión por computadora.
//
// Placeholder de la Fase 0: la estructura del proyecto ya deja el archivo
// listo, pero la implementación real se hace en la Fase 3, después de que
// el motor de cálculo (Fase 2) esté verificado.

export interface FichaHeader {
  cliente: string | null;
  referencia: string | null;
  material: string | null;
  manija: string | null;
  colores: string[];
}

export async function extractHeader(
  _pdfBytes: ArrayBuffer,
): Promise<FichaHeader> {
  throw new Error("extractHeader: pendiente de implementar en la Fase 3");
}
