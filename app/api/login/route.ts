import { NextResponse } from "next/server";
import { getServerPB } from "@/lib/serverAuth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    const pb = await getServerPB();

    await pb.collection("users").authWithPassword(email, password);

    const res = NextResponse.json({ success: true });

    res.cookies.set("pb_auth", pb.authStore.exportToCookie(), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "فشل تسجيل الدخول" },
      { status: 400 }
    );
  }
}