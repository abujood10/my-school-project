import { NextResponse } from "next/server";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();

/* =========================================================
   GET LESSONS (حسب المدرسة + حسب الدور)
========================================================= */
export async function GET(req: Request) {
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

    const lessons = await pb
      .collection("lessons")
      .getFullList({
        filter: `schoolId="${profile.schoolId}"`,
        expand: "teacher",
        sort: "-created",
      });

    return NextResponse.json(lessons);

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
}

/* =========================================================
   CREATE LESSON (المعلم فقط)
========================================================= */
export async function POST(req: Request) {
  try {
    if (!pb.authStore.model) {
      return NextResponse.json(
        { message: "غير مصرح" },
        { status: 401 }
      );
    }

    const { title, description, week } =
      await req.json();

    if (!title || !week) {
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
        { message: "المعلم فقط يمكنه إضافة خطة" },
        { status: 403 }
      );
    }

    if (!profile.schoolId) {
      return NextResponse.json(
        { message: "لا توجد مدرسة مرتبطة" },
        { status: 400 }
      );
    }

    const lesson = await pb
      .collection("lessons")
      .create({
        title,
        description: description || "",
        week,
        teacher: profile.id,
        schoolId: profile.schoolId,
        status: "published",
      });

    return NextResponse.json(lesson);

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
}