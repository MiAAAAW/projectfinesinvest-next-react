// ═══════════════════════════════════════════════════════════════════════════════
// AUTH HELPERS - FINESI
// JWT + bcrypt para autenticación simple
// ═══════════════════════════════════════════════════════════════════════════════

import { cookies } from "next/headers";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════════

const JWT_SECRET = process.env.JWT_SECRET || "cambiar-en-produccion-super-secreto";
const JWT_EXPIRES_IN = "7d";
const COOKIE_NAME = "finesi_token";
const SALT_ROUNDS = 12;

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PASSWORD HASHING (bcryptjs)
// ═══════════════════════════════════════════════════════════════════════════════

export async function hashPassword(password: string): Promise<string> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  const bcrypt = await import("bcryptjs");
  return bcrypt.compare(password, hash);
}

// ═══════════════════════════════════════════════════════════════════════════════
// JWT TOKENS (jsonwebtoken)
// ═══════════════════════════════════════════════════════════════════════════════

export async function createToken(payload: Omit<JWTPayload, "iat" | "exp">): Promise<string> {
  const jwt = await import("jsonwebtoken");
  return jwt.default.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const jwt = await import("jsonwebtoken");
    const decoded = jwt.default.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// COOKIES
// ═══════════════════════════════════════════════════════════════════════════════

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 días
    path: "/",
  });
}

export async function getAuthCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAuthCookie();
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("No autorizado");
  }
  return user;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ROLE CHECKS — verifica que el usuario tenga un rol activo
// ═══════════════════════════════════════════════════════════════════════════════

const ADMIN_ROLE_CODES = ["super_admin", "admin"] as const;

/**
 * Devuelve true si el usuario autenticado tiene un rol ADMIN activo (super_admin o admin).
 * No lanza. Úsalo en APIs que requieren admin.
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const { prisma } = await import("./prisma");
  const hasAdminRole = await prisma.userRole.findFirst({
    where: {
      userId: user.id,
      active: true,
      OR: [{ validUntil: null }, { validUntil: { gt: new Date() } }],
      role: { code: { in: [...ADMIN_ROLE_CODES] }, active: true },
    },
    select: { id: true },
  });
  return !!hasAdminRole;
}

/**
 * Exige que el usuario sea admin. Devuelve el AuthUser o null si no cumple.
 * Úsalo así en APIs:
 *   const admin = await requireAdmin();
 *   if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 403 });
 */
export async function requireAdmin(): Promise<AuthUser | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const ok = await isAdmin();
  return ok ? user : null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGIN / LOGOUT
// ═══════════════════════════════════════════════════════════════════════════════

export async function login(user: {
  id: string;
  email: string;
  name: string;
}): Promise<string> {
  const token = await createToken({
    userId: user.id,
    email: user.email,
    name: user.name,
  });
  await setAuthCookie(token);
  return token;
}

export async function logout(): Promise<void> {
  await removeAuthCookie();
}
