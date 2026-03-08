import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();

export async function getCurrentProfile() {
  if (!pb.authStore.model) {
    throw new Error("Unauthorized");
  }

  const profile = await pb
    .collection("profiles")
    .getFirstListItem(
      `user="${pb.authStore.model.id}"`
    );

  if (!profile.isActive) {
    throw new Error("Account disabled");
  }

  return profile;
}

export function enforceSchoolIsolation(
  profile: any,
  targetSchoolId?: string
) {
  if (profile.role === "super_admin") {
    return; // super_admin يمكنه رؤية الكل
  }

  if (!profile.schoolId) {
    throw new Error("No school assigned");
  }

  if (targetSchoolId && profile.schoolId !== targetSchoolId) {
    throw new Error("Cross-tenant access denied");
  }
}