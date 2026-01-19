import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Rutas protegidas que requieren autenticación
const PROTECTED_ROUTES = ["/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar si es una ruta protegida
  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Verificar cookie de autenticación
  const token = request.cookies.get("finesi_token")?.value;

  if (!token) {
    // Redirigir a login si no hay token
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Token existe, permitir acceso
  // La verificación completa del token se hace en las API routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Proteger rutas admin
    "/admin/:path*",
    // Excluir archivos estáticos y API
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
};
