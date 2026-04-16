export const RESOLUTION_TYPES = [
  { value: "decanal", label: "Resolución Decanal" },
  { value: "rectoral", label: "Resolución Rectoral" },
] as const;

export const RESOLUTION_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  decanal: { label: "Decanal", color: "bg-blue-500/10 text-blue-500" },
  rectoral: { label: "Rectoral", color: "bg-purple-500/10 text-purple-500" },
};
