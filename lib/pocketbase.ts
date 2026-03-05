import PocketBase from "pocketbase";

const pbUrl = process.env.NEXT_PUBLIC_PB_URL;

if (!pbUrl) {
  throw new Error("NEXT_PUBLIC_PB_URL is not defined");
}

const pb = new PocketBase(pbUrl);

// مهم جدًا في بيئة Next
pb.autoCancellation(false);

export default pb;