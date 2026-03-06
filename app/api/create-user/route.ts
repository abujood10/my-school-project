import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function POST(req: Request) {
  try {
    const { email, password, role, schoolId, name } = await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

    // 🔐 قراءة التوكن من الهيدر
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { message: "غير مصرح" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    pb.authStore.save(token, null);

    if (!pb.authStore.isValid) {
      return NextResponse.json(
        { message: "توكن غير صالح" },
        { status: 401 }
      );
    }

    // 📄 جلب بروفايل المنفذ
    const requesterProfile = await pb
      .collection("profiles")
      .getFirstListItem(
        `user="${pb.authStore.model?.id}"`,
        { expand: "schoolId" }
      );

    const requesterRole = requesterProfile.role;
    const requesterSchoolId = requesterProfile.schoolId;

    if (role === "super_admin") {
      return NextResponse.json(
        { message: "غير مسموح بإنشاء هذا الدور" },
        { status: 403 }
      );
    }

    let finalSchoolId: string | null = null;

    // 👑 super_admin ينشئ school_admin فقط
    if (requesterRole === "super_admin") {

      if (role !== "school_admin") {
        return NextResponse.json(
          { message: "يمكنك إنشاء مدير مدرسة فقط" },
          { status: 403 }
        );
      }

      if (!schoolId) {
        return NextResponse.json(
          { message: "يجب تحديد المدرسة" },
          { status: 400 }
        );
      }

      finalSchoolId = schoolId;
    }

    // 🏫 school_admin
    else if (requesterRole === "school_admin") {

      if (
        role !== "teacher" &&
        role !== "parent" &&
        role !== "vice_principal"
      ) {
        return NextResponse.json(
          { message: "ليس لديك صلاحية لإنشاء هذا الحساب" },
          { status: 403 }
        );
      }

      finalSchoolId = requesterSchoolId;

      const school = requesterProfile.expand?.schoolId;

      if (!school) {
        return NextResponse.json(
          { message: "المدرسة غير موجودة" },
          { status: 400 }
        );
      }

      const now = new Date();

      if (
        school.status !== "active" ||
        (school.expiresAt && new Date(school.expiresAt) < now)
      ) {
        return NextResponse.json(
          { message: "تم إيقاف المدرسة أو انتهاء الاشتراك" },
          { status: 403 }
        );
      }

      // فحص حد الباقة (إن وجد)
      if (school.plan) {
        const plan = await pb.collection("plans").getOne(school.plan);

        const usersCount = await pb.collection("profiles").getList(1, 1, {
          filter: `schoolId="${finalSchoolId}"`,
        });

        if (plan.maxUsers && usersCount.totalItems >= plan.maxUsers) {
          return NextResponse.json(
            { message: "تم تجاوز الحد الأقصى للمستخدمين في باقتك" },
            { status: 403 }
          );
        }
      }
    }

    else {
      return NextResponse.json(
        { message: "غير مصرح لك بإنشاء حسابات" },
        { status: 403 }
      );
    }

    // ✅ إنشاء المستخدم
    const user = await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      verified: true,
    });

    // ✅ إنشاء البروفايل
    await pb.collection("profiles").create({
      user: user.id,
      role,
      schoolId: finalSchoolId,
      name: name || "",
      isActive: true,
    });

    return NextResponse.json({
      message: "تم إنشاء الحساب بنجاح",
    });

  } catch (err: any) {
    return NextResponse.json(
      { message: err?.message || "حدث خطأ" },
      { status: 400 }
    );
  }
}