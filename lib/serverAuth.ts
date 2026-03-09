// lib/serverAuth.ts

import PocketBase from "pocketbase";
import { cookies } from "next/headers";

export async function getServerPB() {
  const pb = new PocketBase(
    process.env.NEXT_PUBLIC_PB_URL
  );

  const cookieStore = cookies();
  const authCookie = cookieStore.get("pb_auth");

  if (authCookie?.value) {
    pb.authStore.loadFromCookie(authCookie.value);
  }

  return pb;
}