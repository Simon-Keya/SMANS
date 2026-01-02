// middleware.ts
import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const roleBasedRoutes: Record<string, string[]> = {
  admin: ["/dashboard"],
  teacher: ["/dashboard"],
  student: ["/dashboard"],
  parent: ["/dashboard"],
};

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow auth routes
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Only protect dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Not authenticated → login
  if (!token) {
    const loginUrl = new URL("/auth/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string | undefined;

  if (!role || !roleBasedRoutes[role]) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
