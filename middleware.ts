import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session cookie
  const sessionCookie = request.cookies.get("user_session")?.value;

  // Public routes that don't need authentication
  const publicRoutes = ["/", "/auth/login", "/auth/register"];
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // If no session cookie, redirect to login
  if (!sessionCookie) {
    if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return NextResponse.next();
  }

  // At this point, user has a session cookie
  // Admin routes protection: only admins can access /admin/*
  if (pathname.startsWith("/admin")) {
    // We can't decode the user role in middleware (it's just a UUID in the cookie)
    // So we'll let the layout handle the actual role check
    // But we ensure they have a session
    return NextResponse.next();
  }

  // Dashboard routes: users with valid session can access
  if (pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
