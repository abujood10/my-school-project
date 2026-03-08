import { cookies } from "next/headers";
import { createPB } from "./pocketbase";

export async function getServerPB() {
  const cookieStore = await cookies();

  const authCookie = cookieStore.get("pb_auth")?.value;

  const pb = createPB(authCookie);

  return pb;
}