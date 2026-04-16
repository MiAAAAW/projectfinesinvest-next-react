export const TEACHER_ROLES = [
  { value: "coordinador", label: "Coordinador" },
  { value: "investigador", label: "Investigador" },
  { value: "colaborador", label: "Colaborador" },
] as const;

export const TEACHER_ROLE_VALUES = ["coordinador", "investigador", "colaborador"] as const;

export const TEACHER_ROLE_LABELS: Record<string, { label: string; color: string }> = {
  coordinador: { label: "Coordinador", color: "bg-primary text-primary-foreground" },
  investigador: { label: "Investigador", color: "bg-blue-500/10 text-blue-600" },
  colaborador: { label: "Colaborador", color: "bg-gray-500/10 text-gray-600" },
};

export const TEACHER_DEGREES = [
  { value: "none", label: "Sin título" },
  { value: "Ing.", label: "Ingeniero (Ing.)" },
  { value: "Lic.", label: "Licenciado (Lic.)" },
  { value: "Mg.", label: "Magíster (Mg.)" },
  { value: "Dr.", label: "Doctor (Dr.)" },
  { value: "PhD.", label: "PhD" },
] as const;

export type TeacherRole = typeof TEACHER_ROLE_VALUES[number];

export const TEACHER_CATEGORIES = [
  { value: "PRINC.D.E", label: "Principal D.E." },
  { value: "PRINC.T.C", label: "Principal T.C." },
  { value: "ASOC.T.C.", label: "Asociado T.C." },
  { value: "AUX.T.C.", label: "Auxiliar T.C." },
  { value: "AUX.T.P.", label: "Auxiliar T.P." },
] as const;

export const TEACHER_EMPLOYMENT_TYPES = [
  { value: "N", label: "Nombrado" },
  { value: "C", label: "Contratado" },
] as const;
