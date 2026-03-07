import { getServerPB } from "./serverAuth";

type LogOptions = {
  action: string;
  targetType: string;
  targetId?: string;
  meta?: any;
};

export async function logAudit({
  action,
  targetType,
  targetId,
  meta,
}: LogOptions) {
  try {
    const pb = await getServerPB();

    if (!pb.authStore.model) return;

    const profile = await pb
      .collection("profiles")
      .getFirstListItem(
        `user="${pb.authStore.model.id}"`,
        { expand: "schoolId" }
      );

    await pb.collection("audit_logs").create({
      user: pb.authStore.model.id,
      schoolId: profile.schoolId || null,
      action,
      targetType,
      targetId: targetId || "",
      meta: meta || {},
    });

  } catch (err) {
    console.error("Audit Log Error:", err);
  }
}