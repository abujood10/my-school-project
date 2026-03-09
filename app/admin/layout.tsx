"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();

        if (!res.ok || data.role !== "school_admin") {
          router.replace("/");
          return;
        }

        setAuthorized(true);
      } catch {
        router.replace("/");
      }
    }

    check();
  }, [router]);

  if (authorized === null) {
    return <p style={{ padding: 20 }}>جاري التحقق...</p>;
  }

  if (!authorized) return null;

  return <>{children}</>;
}