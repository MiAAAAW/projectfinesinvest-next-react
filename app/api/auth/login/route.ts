import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, login } from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Password requerido"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar input
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
      include: {
        roles: {
          where: { active: true },
          include: { role: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Verificar si usuario está activo
    if (!user.active) {
      return NextResponse.json(
        { error: "Usuario desactivado" },
        { status: 401 }
      );
    }

    // Verificar password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Crear sesión
    await login({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    // Retornar usuario (sin password)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: user.roles.map((ur) => ({
          code: ur.role.code,
          name: ur.role.name,
          context: ur.context,
        })),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
