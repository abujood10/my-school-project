import { NextResponse } from "next/server";
import { getServerPB } from "@/lib/serverAuth";

export async function GET() {
  try {
    const pb = await getServerPB();

    if (!pb.authStore.model) {
      return NextResponse.json({ count: 0 });
    }

    const profile = await pb
      .collection("profiles")
      .getFirstListItem(
        `user="${pb.authStore.model.id}"`,
        { expand: "schoolId" }
      );

    const res = await pb.collection("notifications").getList(1, 1, {
      filter: `schoolId="${profile.schoolId}" && read=false`,
    });

    return NextResponse.json({
      count: res.totalItems || 0,
    });

  } catch {
    return NextResponse.json({ count: 0 });
  }
}