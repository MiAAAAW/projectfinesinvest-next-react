"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT PUBLICATION PAGE
// Formulario para editar publicación existente
// Incluye gestión de autores
// ═══════════════════════════════════════════════════════════════════════════════

import { use, useState, useEffect } from "react";
import { useEntityForm } from "@/hooks/use-entity-form";
import {
  EditPageHeader, EditPageSkeleton, NotFoundState, FormActionsCard,
} from "@/components/admin";
import {
  PublicationContentCard,
  PublicationSettingsCard,
  PublicationAuthorsCard,
  PUBLICATION_DEFAULTS,
} from "../_components";
import type { PublicationFormData, PublicationAuthor, Teacher } from "../_components";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditPublicationPage({ params }: PageProps) {
  const { id } = use(params);
  const [authors, setAuthors] = useState<PublicationAuthor[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  // Fetch teachers for author card
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await fetch("/api/teachers?status=published&limit=100");
        if (res.ok) {
          const json = await res.json();
          setTeachers(json.data || []);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
      }
    };
    fetchTeachers();
  }, []);

  const {
    formData,
    updateField,
    isLoading,
    isDeleting,
    isFetching,
    notFound,
    handleSubmit,
    handleDelete,
  } = useEntityForm<PublicationFormData>({
    endpoint: "/api/publications",
    entityId: id,
    entityName: "publicación",
    redirectPath: "/admin/publications",
    defaultValues: PUBLICATION_DEFAULTS,
    mapApiToForm: (data) => {
      // Set authors from API response
      if (data.authors) {
        setAuthors(data.authors as PublicationAuthor[]);
      }
      return {
        title: (data.title as string) || "",
        abstract: (data.abstract as string) || "",
        journal: (data.journal as string) || "",
        year: String(data.year ?? new Date().getFullYear()),
        volume: (data.volume as string) || "",
        issue: (data.issue as string) || "",
        pages: (data.pages as string) || "",
        doi: (data.doi as string) || "",
        url: (data.url as string) || "",
        type: (data.type as string) || "articulo",
        indexedIn: (data.indexedIn as string) || "",
        published: (data.published as boolean) ?? true,
      };
    },
    mapFormToApi: (form) => ({
      title: form.title,
      abstract: form.abstract || null,
      journal: form.journal || null,
      year: parseInt(form.year) || new Date().getFullYear(),
      volume: form.volume || null,
      issue: form.issue || null,
      pages: form.pages || null,
      doi: form.doi || null,
      url: form.url || null,
      type: form.type,
      indexedIn: form.indexedIn || null,
      published: form.published,
    }),
  });

  if (isFetching) return <EditPageSkeleton />;

  if (notFound) {
    return (
      <NotFoundState
        title="Publicación no encontrada"
        description="La publicación que buscas no existe o fue eliminada."
        backHref="/admin/publications"
        backLabel="Volver a publicaciones"
      />
    );
  }

  return (
    <div className="space-y-6">
      <EditPageHeader
        backHref="/admin/publications"
        title="Editar Publicación"
        description="Modifica la información de la publicación"
        onDelete={handleDelete}
        isDeleting={isDeleting}
        deleteTitle="¿Eliminar publicación?"
        deleteDescription="Esta acción no se puede deshacer. La publicación será eliminada permanentemente junto con todos sus autores."
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <PublicationContentCard formData={formData} updateField={updateField} />
            <PublicationAuthorsCard
              publicationId={id}
              authors={authors}
              setAuthors={setAuthors}
              teachers={teachers}
            />
          </div>

          <div className="space-y-6">
            <PublicationSettingsCard formData={formData} updateField={updateField} />
            <FormActionsCard
              isLoading={isLoading}
              cancelHref="/admin/publications"
              saveLabel="Guardar cambios"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
