import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "الرجاء إدخال البريد وكلمة المرور" },
        { status: 400 }
      );
    }

    const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

    // 🔐 تسجيل الدخول
    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);

    const user = authData.record;

    // 🚫 إذا الحساب غير مفعل
    if (!user.isActive) {
      pb.authStore.clear();
      return NextResponse.json(
        { message: "تم تعطيل هذا الحساب" },
        { status: 403 }
      );
    }

    // 👑 super_admin لا يحتاج مدرسة
    if (user.role === "super_admin") {
      return NextResponse.json({
        role: user.role,
        schoolId: null,
        token: pb.authStore.token,
      });
    }

    // 🔎 التحقق من وجود مدرسة
    if (!user.schoolId) {
      pb.authStore.clear();
      return NextResponse.json(
        { message: "لا توجد مدرسة مرتبطة بالحساب" },
        { status: 403 }
      );
    }

    // 🔎 فحص حالة المدرسة
    const school = await pb
      .collection("schools")
      .getOne(user.schoolId);

    const now = new Date();

    if (
      school.status !== "active" ||
      (school.expiresAt && new Date(school.expiresAt) < now)
    ) {
      pb.authStore.clear();
      return NextResponse.json(
        { message: "تم إيقاف المدرسة أو انتهاء الاشتراك" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      role: user.role,
      schoolId: user.schoolId,
      token: pb.authStore.token,
    });

  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "فشل تسجيل الدخول" },
      { status: 400 }
    );
  }
}