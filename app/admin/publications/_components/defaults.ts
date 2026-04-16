import type { PublicationFormData } from "./types";

export const PUBLICATION_DEFAULTS: PublicationFormData = {
  title: "",
  abstract: "",
  journal: "",
  year: new Date().getFullYear().toString(),
  volume: "",
  issue: "",
  pages: "",
  doi: "",
  url: "",
  type: "articulo",
  indexedIn: "",
  published: true,
};
