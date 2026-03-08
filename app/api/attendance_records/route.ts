import { NextResponse } from "next/server";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();

/* =========================================================
   GET ATTENDANCE (حسب الدور)
========================================================= */
export async function GET(req: Request) {
  try {
    if (!pb.authStore.model) {
      return NextResponse.json(
        { message: "غير مصرح" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

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

    /* ===============================
       ولي الأمر → يرى أبنائه فقط
    =============================== */
    if (profile.role === "parent") {
      if (!studentId) {
        return NextResponse.json(
          { message: "studentId مطلوب" },
          { status: 400 }
        );
      }

      // تحقق أن الطالب تابع لولي الأمر
      const relation = await pb
        .collection("parents_students")
        .getFirstListItem(
          `parent="${profile.id}" && student="${studentId}"`
        );

      if (!relation) {
        return NextResponse.json(
          { message: "غير مصرح لهذا الطالب" },
          { status: 403 }
        );
      }

      const records = await pb
        .collection("attendance_records")
        .getFullList({
          filter: `student="${studentId}"`,
          sort: "-date",
        });

      return NextResponse.json(records);
    }

    /* ===============================
       المعلم → يرى حضور مدرسته
    =============================== */
    if (profile.role === "teacher") {
      const records = await pb
        .collection("attendance_records")
        .getFullList({
          filter: `schoolId="${profile.schoolId}"`,
          expand: "student",
          sort: "-date",
        });

      return NextResponse.json(records);
    }

    return NextResponse.json(
      { message: "غير مصرح" },
      { status: 403 }
    );

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
}

/* =========================================================
   CREATE ATTENDANCE (المعلم فقط)
========================================================= */
export async function POST(req: Request) {
  try {
    if (!pb.authStore.model) {
      return NextResponse.json(
        { message: "غير مصرح" },
        { status: 401 }
      );
    }

    const { studentId, status, date } =
      await req.json();

    if (!studentId || !status) {
      return NextResponse.json(
        { message: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    const profile = await pb
      .collection("profiles")
      .getFirstListItem(
        `user="${pb.authStore.model.id}"`,
        { expand: "schoolId" }
      );

    if (profile.role !== "teacher") {
      return NextResponse.json(
        { message: "المعلم فقط يمكنه تسجيل الحضور" },
        { status: 403 }
      );
    }

    const student = await pb
      .collection("students")
      .getOne(studentId);

    if (student.schoolId !== profile.schoolId) {
      return NextResponse.json(
        { message: "غير مصرح لهذا الطالب" },
        { status: 403 }
      );
    }

    const record = await pb
      .collection("attendance_records")
      .create({
        student: studentId,
        schoolId: profile.schoolId,
        status,
        date: date || new Date().toISOString(),
      });

    return NextResponse.json(record);

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
}