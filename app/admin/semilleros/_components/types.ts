export interface SemilleroFormData {
  name: string;
  description: string;         // Objetivo
  researchLinesText: string;   // Líneas UNAP (multilinea)
  advisorId: string;           // Responsable (docente)
  status: string;
  published: boolean;
}

export interface SemilleroListItem {
  id: string;
  name: string;
  description: string | null;
  researchLinesText: string | null;
  status: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  advisor: { id: string; name: string } | null;
  _count: { students: number; teachers: number };
}

export interface Teacher {
  id: string;
  name: string;
}
