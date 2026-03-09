import { NextResponse } from "next/server";
import { getServerPB } from "@/lib/serverAuth";

export async function POST(req: Request) {
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
        `user="${pb.authStore.model.id}"`
      );

    if (profile.role !== "super_admin") {
      return NextResponse.json(
        { message: "ليس لديك صلاحية" },
        { status: 403 }
      );
    }

    const { schoolId, status } = await req.json();

    if (!schoolId || !status) {
      return NextResponse.json(
        { message: "بيانات ناقصة" },
        { status: 400 }
      );
    }

    await pb.collection("schools").update(schoolId, {
      status,
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
}