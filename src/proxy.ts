import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Modo mantenimiento: reescribe TODO el trafico a /mantenimiento.
// Para desactivar: borra este archivo (o vuelve a la rama main).
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Dejar pasar la propia pagina de mantenimiento y assets estaticos.
  if (
    pathname === "/mantenimiento" ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.png" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/mantenimiento";
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
