"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();



export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    async function check() {
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${pb.authStore.model?.id}"`);

      if (profile.role !== "school_admin") {
        alert("غير مصرح");
        router.push("/");
      }
    }

    check();
  }, []);

  return <>{children}</>;
}
