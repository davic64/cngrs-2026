// ponytail: keyword OCR check, not forensic ID validation. It confirms the photo
// looks like an official Mexican ID — not a selfie/blank. Upgrade to a document
// classifier model if spoofing ever matters.

const ID_KEYWORDS = [
  // INE / IFE (México)
  "INSTITUTO NACIONAL ELECTORAL",
  "INSTITUTO FEDERAL ELECTORAL",
  "CREDENCIAL PARA VOTAR",
  "CLAVE DE ELECTOR",
  "ESTADOS UNIDOS MEXICANOS",
  "CURP",
  "DOMICILIO",
  "VIGENCIA",
  // Pasaporte — campos bilingües comunes (MX, USA, El Salvador, Guatemala, Honduras)
  "PASAPORTE",
  "PASSPORT",
  "PASSEPORT",
  "NACIONALIDAD",
  "NATIONALITY",
  "APELLIDOS",
  "SURNAME",
  "FECHA DE NACIMIENTO",
  "DATE OF BIRTH",
  "SEXO",
  // Países emisores de pasaporte esperados
  "UNITED STATES OF AMERICA",
  "DEPARTMENT OF STATE",
  "EL SALVADOR",
  "GUATEMALA",
  "HONDURAS",
  "CANADA",
];

function normalize(s: string): string {
  return s
    .toUpperCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/\s+/g, " ");
}

/** Count how many ID keywords appear in OCR'd text. Pure — safe to unit-test. */
export function countIdKeywords(text: string): number {
  const norm = normalize(text);
  return ID_KEYWORDS.filter((k) => norm.includes(normalize(k))).length;
}

/** OCR the image in-browser (no API key) and return true if it looks like an ID. */
export async function verifyIsIdDocument(file: File): Promise<boolean> {
  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker("spa");
  try {
    const {
      data: { text },
    } = await worker.recognize(file);
    return countIdKeywords(text) >= 2;
  } finally {
    await worker.terminate();
  }
}
