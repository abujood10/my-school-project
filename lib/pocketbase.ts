import PocketBase from "pocketbase";

export function createPB(authCookie?: string) {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

  if (authCookie) {
    pb.authStore.loadFromCookie(authCookie);
  }

  return pb;
}