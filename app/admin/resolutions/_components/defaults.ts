import type { ResolutionFormData } from "./types";

export function getResolutionDefaults(type: string): ResolutionFormData {
  const now = new Date();
  return {
    number: "",
    subject: "",
    type,
    date: now.toISOString().split("T")[0],
    year: now.getFullYear().toString(),
    fileUrl: "",
    fileSize: "",
    published: true,
  };
}
