// middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const cookie = req.cookies.get("pb_auth");

  const protectedRoutes = [
    "/admin",
    "/super-admin",
    "/teacher",
    "/parents",
    "/vice-principal",
  ];

  const isProtected = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtected && !cookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}