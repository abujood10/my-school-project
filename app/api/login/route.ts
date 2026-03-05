import { NextResponse } from "next/server";
import pb from "@/lib/pocketbase";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    

    const authData = await pb
      .collection("users")
      .authWithPassword(email, password);

    const profile = await pb
      .collection("profiles")
      .getFirstListItem(`user="${authData.record.id}"`);

    return NextResponse.json({
      role: profile.role,
    });

  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 400 }
    );
  }
}