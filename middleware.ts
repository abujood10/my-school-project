import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/expired") ||
    pathname.startsWith("/_next")
  ) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get("pb_auth");
  if (!cookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    pb.authStore.loadFromCookie(cookie.value);

    const profile = await pb
      .collection("profiles")
      .getFirstListItem(`user="${pb.authStore.model?.id}"`, {
        expand: "schoolId",
      });

    const school = profile.expand?.schoolId;

    if (!school) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // ✅ تحقق آمن من الحالة
    const isExpired =
      school.status !== "active" ||
      (school.expiresAt &&
        new Date(school.expiresAt).getTime() < Date.now());

    if (isExpired) {
      return NextResponse.redirect(new URL("/expired", req.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico).*)"],
};
