import { NextResponse } from "next/server";
import { createPB } from "@/lib/pocketbase";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const pb = createPB();

    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);

    let role = null;

    // أولاً حاول جلب profile
    try {
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(
          `user="${authData.record.id}"`
        );

      role = profile.role;
    } catch {
      // إذا لم يوجد profile
      role = authData.record.role || null;
    }

    if (!role) {
      return NextResponse.json(
        { message: "الدور غير معروف" },
        { status: 400 }
      );
    }

    const res = NextResponse.json({ role });

    res.cookies.set("pb_auth", pb.authStore.exportToCookie(), {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;

  } catch {
    return NextResponse.json(
      { message: "بيانات غير صحيحة" },
      { status: 400 }
    );
  }
}