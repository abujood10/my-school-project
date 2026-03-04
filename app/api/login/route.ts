import { NextResponse } from "next/server";
import PocketBase from "pocketbase";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const pb = new PocketBase("http://127.0.0.1:8090");

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