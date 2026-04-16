export const PUBLICATION_TYPES = [
  { value: "articulo", label: "Artículo" },
  { value: "libro", label: "Libro" },
  { value: "capitulo", label: "Capítulo de libro" },
  { value: "tesis", label: "Tesis" },
  { value: "conferencia", label: "Conferencia" },
] as const;

export const PUBLICATION_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  articulo: { label: "Artículo", color: "bg-blue-500/10 text-blue-500" },
  libro: { label: "Libro", color: "bg-purple-500/10 text-purple-500" },
  capitulo: { label: "Capítulo", color: "bg-green-500/10 text-green-500" },
  tesis: { label: "Tesis", color: "bg-orange-500/10 text-orange-500" },
  conferencia: { label: "Conferencia", color: "bg-cyan-500/10 text-cyan-500" },
};

export const INDEXED_IN_OPTIONS = [
  { value: "scopus", label: "Scopus" },
  { value: "wos", label: "Web of Science" },
  { value: "scielo", label: "SciELO" },
  { value: "latindex", label: "Latindex" },
] as const;
