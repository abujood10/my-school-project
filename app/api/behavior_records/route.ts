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

    const { studentId, behaviorId, points, note } =
      await req.json();

    const profile = await pb
      .collection("profiles")
      .getFirstListItem(
        `user="${pb.authStore.model.id}"`,
        { expand: "schoolId" }
      );

    if (
      profile.role !== "teacher" &&
      profile.role !== "vice_principal"
    ) {
      return NextResponse.json(
        { message: "غير مصرح" },
        { status: 403 }
      );
    }

    const record = await pb
      .collection("behavior_records")
      .create({
        student: studentId,
        behavior: behaviorId,
        points,
        note,
        schoolId: profile.schoolId,
        status: "approved",
      });

    await logAudit({
      action: "CREATE_BEHAVIOR",
      targetType: "behavior_record",
      targetId: record.id,
      meta: { studentId, points },
    });

    return NextResponse.json(record);

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
}