"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE PAGE HEADER
// Header simple para las páginas de crear (sin botón eliminar)
// ═══════════════════════════════════════════════════════════════════════════════

interface CreatePageHeaderProps {
  backHref: string;
  title: string;
  description: string;
}

export function CreatePageHeader({
  backHref,
  title,
  description,
}: CreatePageHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" asChild>
        <Link href={backHref}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
