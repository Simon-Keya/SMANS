// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public routes - allow access
  const publicPaths = [
    "/auth/login",
    "/auth/signup",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/auth/verify-email",
    "/",
  ];
  
  if (publicPaths.some((p) => pathname === p || pathname.startsWith(p + "?"))) {
    return NextResponse.next();
  }

  // ✅ ALLOW PUBLIC API ROUTES (including /api/classes)
  if (pathname.startsWith("/api/auth") || 
      pathname === "/api/webhooks" ||
      pathname === "/api/classes" ||
      pathname.startsWith("/api/classes/")) {
    return NextResponse.next();
  }

  // Protect all dashboard routes
  if (pathname.startsWith("/dashboard")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check if account is active
    if (token.isActive === false) {
      const loginUrl = new URL("/auth/login", req.url);
      loginUrl.searchParams.set("error", "account_deactivated");
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Protect other protected API routes
  if (pathname.startsWith("/api/protected")) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (token.isActive === false) {
      return NextResponse.json(
        { error: "Account deactivated" },
        { status: 403 }
      );
    }

    return NextResponse.next();
  }

  // Allow all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/protected/:path*",
    "/auth/:path*",
    "/api/classes",
    "/api/classes/:path*",
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};