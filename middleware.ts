import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🔥 استثناء مسارات PocketBase
  if (
    pathname.startsWith("/pb") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

  const host = req.headers.get("host") || "";
  const subdomain = host.split(".")[0];

  if (
    host.startsWith("localhost") ||
    host.startsWith("www")
  ) {
    return NextResponse.next();
  }

  try {
    const school = await pb
      .collection("schools")
      .getFirstListItem(`subdomain="${subdomain}"`);

    const now = new Date();

    if (
      school.status !== "active" ||
      (school.expiresAt && new Date(school.expiresAt) < now)
    ) {
      return NextResponse.redirect(new URL("/expired", req.url));
    }

    const response = NextResponse.next();
    response.headers.set("x-school-id", school.id);
    response.headers.set("x-school-name", school.name);

    return response;

  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
}

export const config = {
  matcher: ["/:path*"],
};