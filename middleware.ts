import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import PocketBase from "pocketbase";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // السماح بالمسارات العامة
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname === "/login" ||
    pathname === "/" ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const host = request.headers.get("host") || "";

  const parts = host.split(".");
  const isSubdomain = parts.length > 2;
  const subdomain = isSubdomain ? parts[0] : null;

  const authCookie = request.cookies.get("pb_auth");

  if (!authCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);
  pb.authStore.loadFromCookie(authCookie.value);

  if (!pb.authStore.model) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const profile = await pb
      .collection("profiles")
      .getFirstListItem(
        `user="${pb.authStore.model.id}"`,
        { expand: "schoolId" }
      );

    /* ===============================
       👑 SUPER ADMIN
    =============================== */

    if (profile.role === "super_admin") {
      // لا يسمح له بالدخول من subdomain
      if (isSubdomain) {
        return NextResponse.redirect(
          new URL("https://myschoolsnet.cloud/super-admin")
        );
      }

      return NextResponse.next();
    }

    /* ===============================
       🏫 SCHOOL USERS
    =============================== */

    // يجب أن يكونوا داخل subdomain
    if (!isSubdomain || !subdomain) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    const school = await pb
      .collection("schools")
      .getFirstListItem(
        `subdomain="${subdomain}"`
      );

    // منع cross-school
    if (profile.schoolId !== school.id) {
      return NextResponse.redirect(
        new URL("/login", request.url)
      );
    }

    // فحص حالة المدرسة
    if (school.status !== "active") {
      return NextResponse.redirect(
        new URL("/school-suspended", request.url)
      );
    }

    if (school.expiresAt) {
      const now = new Date();
      const end = new Date(school.expiresAt);

      if (now > end) {
        return NextResponse.redirect(
          new URL("/expired", request.url)
        );
      }
    }

    return NextResponse.next();

  } catch {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }
}

export const config = {
  matcher: ["/((?!_next|favicon.ico).*)"],
};