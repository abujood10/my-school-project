import { NextResponse } from "next/server";
import { getServerPB } from "@/lib/serverAuth";
import { logAudit } from "@/lib/auditLogger";

export async function POST(req: Request) {
  try {
    const pb = await getServerPB();

    if (!pb.authStore.model) {
      return NextResponse.json(
        { message: "غير مصرح" },
        { status: 401 }
      );
    }

    const { email, password, role, schoolId, name } =
      await req.json();

    if (!email || !password || !role) {
      return NextResponse.json(
        { message: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    const requesterProfile = await pb
      .collection("profiles")
      .getFirstListItem(
        `user="${pb.authStore.model.id}"`,
        { expand: "schoolId" }
      );

    const requesterRole = requesterProfile.role;
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
          { message: "ليس لديك صلاحية" },
          { status: 403 }
        );
      }

      finalSchoolId = requesterProfile.schoolId;
    }

    else {
      return NextResponse.json(
        { message: "غير مصرح" },
        { status: 403 }
      );
    }

    // إنشاء المستخدم
    const user = await pb.collection("users").create({
      email,
      password,
      passwordConfirm: password,
      verified: true,
    });

    // إنشاء البروفايل
    const profile = await pb.collection("profiles").create({
      user: user.id,
      role,
      schoolId: finalSchoolId,
      name: name || "",
      isActive: true,
    });

    await logAudit({
      action: "CREATE_USER",
      targetType: "user",
      targetId: user.id,
      meta: { role, email },
    });

    return NextResponse.json({
      message: "تم إنشاء الحساب بنجاح",
    });

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
}