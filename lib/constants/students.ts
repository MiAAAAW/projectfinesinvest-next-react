// ═══════════════════════════════════════════════════════════════════════════════
// STUDENT CONSTANTS
// Fuente única de verdad para todas las opciones de estudiantes.
// Usado por: admin forms, API validators, public display.
// ═══════════════════════════════════════════════════════════════════════════════

export interface LabeledOption<T extends string = string> {
  value: T;
  label: string;
}

export interface LabeledOptionColored<T extends string = string> extends LabeledOption<T> {
  color: "default" | "secondary" | "outline" | "destructive";
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRAMAS ACADÉMICOS
// ─────────────────────────────────────────────────────────────────────────────

export const STUDENT_PROGRAMS: LabeledOption[] = [
  { value: "ing-estadistica-informatica", label: "Ingeniería Estadística e Informática" },
  { value: "ing-estadistica", label: "Ingeniería Estadística" },
  { value: "ing-informatica", label: "Ingeniería Informática" },
  { value: "maestria-estadistica", label: "Maestría en Estadística Aplicada" },
  { value: "maestria-informatica", label: "Maestría en Ciencias de la Computación" },
  { value: "doctorado-ciencias-datos", label: "Doctorado en Ciencias de Datos" },
];

export const STUDENT_PROGRAM_VALUES = STUDENT_PROGRAMS.map((p) => p.value) as unknown as [
  string,
  ...string[],
];

// ─────────────────────────────────────────────────────────────────────────────
// ESTADOS DEL ESTUDIANTE
// ─────────────────────────────────────────────────────────────────────────────

export const STUDENT_STATUSES: LabeledOptionColored[] = [
  { value: "activo", label: "Activo", color: "default" },
  { value: "egresado", label: "Egresado", color: "secondary" },
  { value: "bachiller", label: "Bachiller", color: "secondary" },
  { value: "titulado", label: "Titulado", color: "default" },
  { value: "retirado", label: "Retirado", color: "destructive" },
  { value: "reserva", label: "Reserva de matrícula", color: "outline" },
];

export const STUDENT_STATUS_VALUES = STUDENT_STATUSES.map((s) => s.value) as unknown as [
  string,
  ...string[],
];

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS DE INGRESO
// ─────────────────────────────────────────────────────────────────────────────

export const ADMISSION_TYPES: LabeledOption[] = [
  { value: "ordinario", label: "Ordinario" },
  { value: "cepreuna", label: "CEPREUNA" },
  { value: "traslado-interno", label: "Traslado interno" },
  { value: "traslado-externo", label: "Traslado externo" },
  { value: "extraordinario", label: "Extraordinario" },
  { value: "convenio", label: "Por convenio" },
];

export const ADMISSION_TYPE_VALUES = ADMISSION_TYPES.map((a) => a.value) as unknown as [
  string,
  ...string[],
];

// Valor por defecto centralizado
export const STUDENT_DEFAULT_STATUS = "activo";
export const SELECT_NONE_SENTINEL = "__none__";

// ─────────────────────────────────────────────────────────────────────────────
// SEMESTRES ACADÉMICOS (I o II)
// ─────────────────────────────────────────────────────────────────────────────

export const SEMESTER_PERIODS: LabeledOption[] = [
  { value: "I", label: "I Semestre" },
  { value: "II", label: "II Semestre" },
];

// ─────────────────────────────────────────────────────────────────────────────
// TIPOS DE DOCUMENTO (para User)
// ─────────────────────────────────────────────────────────────────────────────

export const DOCUMENT_TYPES: LabeledOption[] = [
  { value: "DNI", label: "DNI" },
  { value: "CE", label: "Carnet de Extranjería" },
  { value: "pasaporte", label: "Pasaporte" },
];

// ─────────────────────────────────────────────────────────────────────────────
// GÉNEROS
// ─────────────────────────────────────────────────────────────────────────────

export const GENDERS: LabeledOption[] = [
  { value: "M", label: "Masculino" },
  { value: "F", label: "Femenino" },
  { value: "O", label: "Otro" },
];

// ─────────────────────────────────────────────────────────────────────────────
// ROLES EN GRUPOS/SEMILLEROS
// ─────────────────────────────────────────────────────────────────────────────

export const GROUP_STUDENT_ROLES: LabeledOption[] = [
  { value: "miembro", label: "Miembro" },
  { value: "coordinador", label: "Coordinador" },
  { value: "tesista", label: "Tesista" },
];

export const SEMILLERO_STUDENT_ROLES: LabeledOption[] = [
  { value: "miembro", label: "Miembro" },
  { value: "coordinador", label: "Coordinador" },
  { value: "tesista", label: "Tesista" },
];

export const GROUP_TEACHER_ROLES: LabeledOption[] = [
  { value: "director", label: "Director" },
  { value: "co-director", label: "Co-Director" },
  { value: "investigador", label: "Investigador" },
];

export const SEMILLERO_TEACHER_ROLES: LabeledOption[] = [
  { value: "co-asesor", label: "Co-asesor" },
  { value: "asesor-adjunto", label: "Asesor adjunto" },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Encuentra el label de una opción por su value */
export function findLabel<T extends LabeledOption>(
  options: T[],
  value: string | null | undefined
): string {
  if (!value) return "";
  return options.find((o) => o.value === value)?.label ?? value;
}

/** Encuentra la opción completa (con color, etc.) */
export function findOption<T extends LabeledOption>(
  options: T[],
  value: string | null | undefined
): T | undefined {
  if (!value) return undefined;
  return options.find((o) => o.value === value);
}

/** Compone nombre completo desde partes (cache) */
export function composeFullName(
  firstName: string,
  lastNamePaternal: string,
  lastNameMaternal?: string | null
): string {
  return [firstName, lastNamePaternal, lastNameMaternal].filter(Boolean).join(" ").trim();
}
