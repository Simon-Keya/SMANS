// middleware.ts
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];

const roleBasedRoutes: Record<string, string[]> = {
  admin: ["/dashboard/students", "/dashboard/grades"],
  teacher: ["/dashboard/attendance", "/dashboard/grades/enter"],
  student: ["/dashboard/grades", "/dashboard/timetable"],
  parent: ["/dashboard/grades", "/dashboard/attendance/report"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow all auth-related routes
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Check if the request is for a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get the JWT token (session)
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  // Allow profile page for all authenticated users
  if (pathname.startsWith("/dashboard/profile")) {
    return NextResponse.next();
  }

  // Role-based access control
  if (role && roleBasedRoutes[role]) {
    const allowedRoutes = roleBasedRoutes[role];
    const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

    if (!hasAccess) {
      // Redirect to dashboard home if trying to access unauthorized section
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  // All checks passed
  return NextResponse.next();
}

// Matcher: Apply middleware only to these paths
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
  ],
};