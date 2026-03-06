import { NextRequest, NextResponse } from "next/server";
import pb from "@/lib/pocketbase";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const host = req.headers.get("host") || "";
  const subdomain = host.split(".")[0];

  try {
    const school = await pb
      .collection("schools")
      .getFirstListItem(`subdomain="${subdomain}"`);

    if (school.status !== "active") {
      return NextResponse.redirect(new URL("/expired", req.url));
    }

    const subscription = await pb
      .collection("school_subscriptions")
      .getFirstListItem(
        `school="${school.id}" && status="active"`
      );

    if (
      !subscription ||
      new Date(subscription.endsAt) < new Date()
    ) {
      return NextResponse.redirect(new URL("/expired", req.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/expired", req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};