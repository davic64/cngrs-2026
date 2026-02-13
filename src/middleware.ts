import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { users } from './db/schema';
import { eq } from 'drizzle-orm';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('user_session');
  const userId = session?.value;
  
  const { pathname } = request.nextUrl;
  const isAuthPage = pathname.startsWith('/auth');
  const isDashboardPage = pathname.startsWith('/dashboard');
  const isAdminPage = pathname.startsWith('/admin');

  // 1. Protección básica: Si no hay sesión y va a dashboard o admin -> al login
  if ((isDashboardPage || isAdminPage) && !userId) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // 2. Si ya hay sesión e intenta ir a auth -> al dashboard
  if (isAuthPage && userId) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 3. REGLA DE ADMIN: Solo el número 3318319769 puede entrar a /admin
  if (isAdminPage && userId) {
    try {
      // Conexión rápida para el middleware
      const sql = neon(process.env.DATABASE_URL!);
      const db = drizzle(sql);
      
      const [user] = await db
        .select({ phone: users.phone })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user || user.phone !== '3318319769') {
        // Si no es el admin, lo mandamos al dashboard normal
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    } catch (error) {
      console.error("Error validando admin en middleware:", error);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/auth/:path*',
  ],
};
