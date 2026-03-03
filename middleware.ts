import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 🔥 استثناء المسارات المهمة
  if (
    pathname.startsWith("/pb") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/" // 🔥 مهم جداً
  ) {
    return NextResponse.next();
  }

  const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

  const host = req.headers.get("host") || "";

  // 🔥 إذا كان الدومين الرئيسي بدون subdomain
  if (
    host === "myschoolsnet.cloud" ||
    host === "www.myschoolsnet.cloud" ||
    host.startsWith("localhost")
  ) {
    return NextResponse.next();
  }

  const subdomain = host.split(".")[0];

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
    // 🔥 لا تعيد التوجيه إلى "/" مرة أخرى
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/:path*"],
};