import { NextResponse } from "next/server";
import { getServerPB } from "@/lib/serverAuth";

export async function GET() {
  try {
    const pb = await getServerPB();

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

    return NextResponse.json({
      role: profile.role,
      name: profile.name,
      schoolName: profile.expand?.schoolId?.name || "",
    });

  } catch {
    return NextResponse.json(
      { message: "خطأ" },
      { status: 400 }
    );
  }
}