import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma, notDeleted } from "@/lib/prisma";
import { z } from "zod";

// ═══════════════════════════════════════════════════════════════════════════════
// API UTILITIES
// Helpers para reducir boilerplate en API routes
// ═══════════════════════════════════════════════════════════════════════════════

/** Verificar autenticación. Retorna user o response 401. */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "No autorizado" }, { status: 401 }) };
  }
  return { user, error: null };
}

/** Validar body con Zod schema. Retorna data o response 400. */
export function validateBody<T>(body: unknown, schema: z.ZodSchema<T>) {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      data: null as unknown as T,
      error: NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      ),
    };
  }
  return { data: result.data, error: null };
}

/** Respuesta de error estándar */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

/** Respuesta de éxito estándar */
export function successResponse(data: unknown, status: number = 200) {
  return NextResponse.json({ data }, { status });
}

/** Respuesta de mensaje */
export function messageResponse(message: string) {
  return NextResponse.json({ message });
}

/** Soft delete genérico: verificar existencia + marcar deletedAt */
export async function softDelete(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  id: string,
  entityName: string
) {
  const existing = await model.findFirst({
    where: { id, ...notDeleted },
  });

  if (!existing) {
    return { error: errorResponse(`${entityName} no encontrado`, 404) };
  }

  await model.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  return { error: null };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SOFT DELETE + R2 CLEANUP — patrón unificado para documentos institucionales
//
// 1. Marca la fila como deletedAt (audit trail preservado)
// 2. Borra archivos físicos de R2 (sin huérfanos)
//
// ORDEN: BD primero. Si BD falla → retorna error sin tocar R2.
//        Si R2 falla → log warning, no falla el request (BD ya está consistente).
// ═══════════════════════════════════════════════════════════════════════════════

import { deleteFromR2, getR2KeyFromUrl } from "@/lib/r2";

export interface SoftDeleteR2Options {
  /** URLs de archivos R2 a eliminar (puede tener nulls/undefineds que se filtran) */
  fileUrls: (string | null | undefined)[];
}

export async function softDeleteWithR2(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  id: string,
  entityName: string,
  options: SoftDeleteR2Options
) {
  // [1] Verificar existencia
  const existing = await model.findFirst({
    where: { id, ...notDeleted },
  });
  if (!existing) {
    return { error: errorResponse(`${entityName} no encontrado`, 404) };
  }

  // [2] Soft-delete BD (atómico, primero)
  await model.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  // [3] Cleanup R2 — best-effort, no falla el request
  for (const url of options.fileUrls) {
    if (!url) continue;
    const key = getR2KeyFromUrl(url);
    if (!key) continue; // URL externa, no es de nuestro bucket
    try {
      await deleteFromR2(key);
    } catch (err) {
      console.warn(`[softDeleteWithR2] R2 delete failed for ${key} (${entityName} ${id}):`, err);
      // No throw — la fila ya está soft-deleted, esto es best-effort
    }
  }

  return { error: null };
}
