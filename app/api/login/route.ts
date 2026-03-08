import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

    // تسجيل الدخول
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);

    if (!authData?.record) {
      return NextResponse.json(
        { message: "فشل تسجيل الدخول" },
        { status: 401 }
      );
    }

    const user = authData.record;

    if (!user.isActive) {
      return NextResponse.json(
        { message: "الحساب غير مفعل" },
        { status: 403 }
      );
    }

    if (!user.role) {
      return NextResponse.json(
        { message: "لم يتم تعيين دور للحساب" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      role: user.role,
      userId: user.id,
    });

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "خطأ في تسجيل الدخول" },
      { status: 400 }
    );
  }
}