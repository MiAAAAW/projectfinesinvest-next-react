"use client";

// ═══════════════════════════════════════════════════════════════════════════════
// SEMILLEROS · NORMATIVA (admin)
// Gestor multi-PDF que alimenta el Sheet lateral de la página pública de Semilleros.
// No toca el CRUD principal de Semilleros.
// ═══════════════════════════════════════════════════════════════════════════════

import { ScrollText } from "lucide-react";
import { NormativaUploadCard } from "./_components/NormativaUploadCard";

export default function SemillerosNormativaAdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <ScrollText className="h-6 w-6 text-primary" />
          Semilleros · Normativa
        </h1>
        <p className="text-muted-foreground">
          Resoluciones Rectorales que aparecen en el Sheet lateral de la página pública
          de Semilleros (no afectan la lista de semilleros oficiales).
        </p>
      </div>

      <NormativaUploadCard />
    </div>
  );
}
