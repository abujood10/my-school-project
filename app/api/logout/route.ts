import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({
    message: "تم تسجيل الخروج",
  });

  res.cookies.set("pb_auth", "", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return res;
}