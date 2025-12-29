// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

const protectedRoutes = ["/dashboard"];
const roleBasedRoutes = {
  admin: ["/dashboard/dashboard/students", "/dashboard/grades"],
  teacher: ["/dashboard/attendance", "/dashboard/grades/enter"],
  student: ["/dashboard/grades", "/dashboard/timetable"],
  parent: ["/dashboard/grades", "/dashboard/attendance/report"],
};

export async function middleware(req: any) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  const { pathname } = req.nextUrl;

  // Allow auth routes
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Protect dashboard
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const role = token.role as string;

    // Role-based access control
    if (role && roleBasedRoutes[role as keyof typeof roleBasedRoutes]) {
      const allowed = roleBasedRoutes[role as keyof typeof roleBasedRoutes].some((route) =>
        pathname.startsWith(route)
      );
      if (!allowed && !pathname.startsWith("/dashboard/profile")) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};