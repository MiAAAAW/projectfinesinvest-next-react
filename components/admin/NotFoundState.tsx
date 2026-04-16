"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

// ═══════════════════════════════════════════════════════════════════════════════
// NOT FOUND STATE
// Reemplaza el estado "no encontrado" copy-pasteado en los 6 edit pages
// ═══════════════════════════════════════════════════════════════════════════════

interface NotFoundStateProps {
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}

export function NotFoundState({
  title,
  description,
  backHref,
  backLabel,
}: NotFoundStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Button asChild>
        <Link href={backHref}>{backLabel}</Link>
      </Button>
    </div>
  );
}
