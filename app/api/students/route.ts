import { NextResponse } from "next/server";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();

/* ========================================
   GET STUDENTS (معزول حسب المدرسة)
======================================== */
export async function GET() {
  try {
    if (!pb.authStore.model) {
      return NextResponse.json(
        { message: "غير مصرح" },
        { status: 401 }
      );
    }

    const profile = await pb
      .collection("profiles")
      .getFirstListItem(
        `user="${pb.authStore.model.id}"`,
        { expand: "schoolId" }
      );

    if (!profile.schoolId) {
      return NextResponse.json(
        { message: "لا توجد مدرسة مرتبطة" },
        { status: 400 }
      );
    }

    const students = await pb.collection("students").getFullList({
      filter: `schoolId="${profile.schoolId}"`,
      sort: "name",
    });

    return NextResponse.json(students);

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
}

/* ========================================
   CREATE STUDENT (محمي بالكامل)
======================================== */
export async function POST(req: Request) {
  try {
    if (!pb.authStore.model) {
      return NextResponse.json(
        { message: "غير مصرح" },
        { status: 401 }
      );
    }

    const { name, classId } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "اسم الطالب مطلوب" },
        { status: 400 }
      );
    }

    const profile = await pb
      .collection("profiles")
      .getFirstListItem(
        `user="${pb.authStore.model.id}"`,
        { expand: "schoolId,schoolId.plan" }
      );

    if (profile.role !== "school_admin") {
      return NextResponse.json(
        { message: "ليس لديك صلاحية إضافة طالب" },
        { status: 403 }
      );
    }

    const school = profile.expand?.schoolId;

    if (!school) {
      return NextResponse.json(
        { message: "المدرسة غير موجودة" },
        { status: 400 }
      );
    }

    if (school.status !== "active") {
      return NextResponse.json(
        { message: "المدرسة غير مفعلة" },
        { status: 403 }
      );
    }

    // فحص انتهاء الاشتراك
    if (school.expiresAt) {
      const now = new Date();
      const end = new Date(school.expiresAt);
      if (now > end) {
        return NextResponse.json(
          { message: "انتهى الاشتراك" },
          { status: 403 }
        );
      }
    }

    // فحص حد الباقة
    if (school.expand?.plan?.maxStudents) {
      const current = await pb
        .collection("students")
        .getList(1, 1, {
          filter: `schoolId="${school.id}"`,
        });

      if (current.totalItems >= school.expand.plan.maxStudents) {
        return NextResponse.json(
          { message: "تم تجاوز الحد الأقصى للطلاب" },
          { status: 403 }
        );
      }
    }

    const student = await pb.collection("students").create({
      name,
      schoolId: school.id,
      classId: classId || null,
      totalPoints: 0,
    });

    return NextResponse.json(student);

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
}