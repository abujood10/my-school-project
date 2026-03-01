import PocketBase from "pocketbase";

const pb = new PocketBase(
  process.env.NEXT_PUBLIC_PB_URL
);

// مهم: منع إلغاء الطلبات تلقائياً
pb.autoCancellation(false);

export default pb;