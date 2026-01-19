// ═══════════════════════════════════════════════════════════════════════════════
// PRISMA CLIENT - FINESI
// Singleton para evitar múltiples instancias en desarrollo (hot reload)
// Prisma 7 requiere adapter para conexión directa a PostgreSQL
// ═══════════════════════════════════════════════════════════════════════════════

import { PrismaClient } from "@/lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

// Crear pool de conexión (reutilizar en desarrollo)
const pool =
  globalForPrisma.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

// Crear adapter
const adapter = new PrismaPg(pool);

// Crear cliente Prisma
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS PARA SOFT DELETE
// Filtros comunes para excluir registros eliminados
// ═══════════════════════════════════════════════════════════════════════════════

export const notDeleted = {
  deletedAt: null,
} as const;

// Para queries con where existente
export const whereNotDeleted = <T extends Record<string, unknown>>(
  where: T
): T & { deletedAt: null } => ({
  ...where,
  deletedAt: null,
});

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS PARA PAGINACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export function getPaginationParams(params: PaginationParams) {
  const page = Math.max(1, params.page ?? 1);
  const limit = Math.min(100, Math.max(1, params.limit ?? 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip, take: limit };
}

export function createPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResult<T> {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
