import { NextResponse } from "next/server";
import pb from "@/lib/pocketbase";

/* =========================================
   GET STUDENTS FOR PARENT
========================================= */
export async function GET() {
  try {
    if (!pb.authStore.model) {
      return NextResponse.json(
        { message: "غير مصرح" },
        { status: 401 }
      );
    }

    // جلب بروفايل المستخدم
    const profile = await pb
      .collection("profiles")
      .getFirstListItem(
        `user="${pb.authStore.model.id}"`,
        { expand: "schoolId" }
      );

    if (profile.role !== "parent") {
      return NextResponse.json(
        { message: "غير مصرح" },
        { status: 403 }
      );
    }

    if (!profile.schoolId) {
      return NextResponse.json(
        { message: "لا توجد مدرسة مرتبطة" },
        { status: 400 }
      );
    }

    // جلب الطلاب المرتبطين بولي الأمر
    const relations = await pb
      .collection("parents_students")
      .getFullList({
        filter: `parent="${profile.id}"`,
        expand: "student",
      });

    const students = relations
      .map((r: any) => r.expand?.student)
      .filter(Boolean)
      .filter(
        (s: any) => s.schoolId === profile.schoolId
      )
      .map((s: any) => ({
        id: s.id,
        name: s.name,
      }));

    return NextResponse.json(students);

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
}