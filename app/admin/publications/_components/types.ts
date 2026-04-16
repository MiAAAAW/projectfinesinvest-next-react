export interface PublicationFormData {
  title: string;
  abstract: string;
  journal: string;
  year: string;
  volume: string;
  issue: string;
  pages: string;
  doi: string;
  url: string;
  type: string;
  indexedIn: string;
  published: boolean;
}

export interface PublicationAuthor {
  id: string;
  name: string;
  order: number;
  teacherId: string | null;
  teacher?: {
    id: string;
    name: string;
  } | null;
}

export interface Teacher {
  id: string;
  name: string;
}
