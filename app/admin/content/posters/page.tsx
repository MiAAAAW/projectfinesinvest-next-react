"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// POSTERS FINESI · página admin
// - Encabezado público editable (title + description via site_content)
// - Gestor multi-PDF (N posters, cada uno un Document con category="posters")
// ═══════════════════════════════════════════════════════════════════════════════

import { Presentation } from "lucide-react";
import { PageHeaderEditor } from "@/components/admin/PageHeaderEditor";
import { PostersUploadCard } from "./_components/PostersUploadCard";

export default function PostersAdminPage() {
  return (
    <div className="space-y-6">
      {/* Título de la página admin */}
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Presentation className="h-6 w-6 text-primary" />
          Posters FINESI
        </h1>
        <p className="text-muted-foreground">
          Gestiona los posters reconocidos que se muestran en la página pública
        </p>
      </div>

      {/* Editor del encabezado público */}
      <PageHeaderEditor
        section="posters"
        placeholderTitle="Posters FINESI"
        placeholderDescription="Reconocimientos a posters presentados por estudiantes y docentes de la FINESI."
      />

      {/* Gestor multi-PDF */}
      <PostersUploadCard />
    </div>
  );
}
