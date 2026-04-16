// ═══════════════════════════════════════════════════════════════════════════════
// POSGRADO · constantes compartidas entre admin y público
// Un único lugar para: sección del índice, claves por nivel, prefijos de sección.
// ═══════════════════════════════════════════════════════════════════════════════

export const POSGRADO_HEADER_SECTION = "posgrado";
export const POSGRADO_INDEX_SECTION = "posgrado-index";

export type PosgradoLevel = "maestria" | "doctorado";

export interface PosgradoLevelMeta {
  key: PosgradoLevel;
  labelPlural: string;
  labelSingle: string;
  labelArticle: "la" | "el";
  indexKey: "maestrias" | "doctorados";
  sectionPrefix: string;
}

export const POSGRADO_LEVELS: PosgradoLevelMeta[] = [
  {
    key: "maestria",
    labelPlural: "Maestrías",
    labelSingle: "Maestría",
    labelArticle: "la",
    indexKey: "maestrias",
    sectionPrefix: "posgrado-maestria",
  },
  {
    key: "doctorado",
    labelPlural: "Doctorados",
    labelSingle: "Doctorado",
    labelArticle: "el",
    indexKey: "doctorados",
    sectionPrefix: "posgrado-doctorado",
  },
];

// Claves de texto que representan el contenido editable de cada programa.
// `pdfDocumentId` se maneja aparte (auto-persist, no entra en el save batch).
export const POSGRADO_PROGRAM_TEXT_KEYS = [
  "name",
  "description",
  "content",
  "requisitos",
  "contacto",
] as const;

export type PosgradoProgramTextKey = (typeof POSGRADO_PROGRAM_TEXT_KEYS)[number];

// Parsea el CSV del índice a un array limpio (sin vacíos, sin espacios).
export function parseIndexCsv(value: string | null | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

// Serializa un array de section names a CSV (orden preservado, sin duplicados).
export function serializeIndexCsv(sections: string[]): string {
  return Array.from(new Set(sections.map((s) => s.trim()).filter(Boolean))).join(",");
}

// Genera un section name nuevo único para un nivel dado.
// Formato: `${prefix}-${10charIdRandom}` → colisiones prácticamente imposibles.
export function generateProgramSection(level: PosgradoLevel): string {
  const prefix = POSGRADO_LEVELS.find((l) => l.key === level)!.sectionPrefix;
  const id =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
      : Math.random().toString(36).slice(2, 12);
  return `${prefix}-${id}`;
}
