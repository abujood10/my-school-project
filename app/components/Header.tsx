"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

export default function Header() {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let unsub: (() => void) | null = null;

    async function init() {
      try {
        // جلب بروفايل المستخدم
        const profile = await pb
          .collection("profiles")
          .getFirstListItem(`user="${pb.authStore.model?.id}"`);

        const schoolId = profile.schoolId;

        // جلب العدد الحالي
        const res = await pb.collection("notifications").getList(1, 1, {
          filter: `schoolId="${schoolId}" && read=false`,
        });
        setCount(res.totalItems || 0);

        // الاشتراك اللحظي
        unsub = await pb.collection("notifications").subscribe("*", (e) => {
          const record = e.record;

          // فقط إشعارات المدرسة + غير المقروءة
          if (
            record.schoolId === schoolId &&
            record.read === false
          ) {
            setCount((prev) => prev + 1);
          }

          // لو تم تحديث إشعار إلى مقروء
          if (
            record.schoolId === schoolId &&
            e.action === "update" &&
            record.read === true
          ) {
            setCount((prev) => Math.max(prev - 1, 0));
          }
        });
      } catch {
        // تجاهل
      }
    }

    init();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderBottom: "1px solid #eee",
      }}
    >
      <strong>بوابة ولي الأمر</strong>

      <Link href="/parents/notifications" style={{ position: "relative" }}>
        🔔
        {count > 0 && (
          <span
            style={{
              position: "absolute",
              top: -6,
              right: -10,
              background: "red",
              color: "white",
              borderRadius: "50%",
              padding: "2px 6px",
              fontSize: 12,
            }}
          >
            {count}
          </span>
        )}
      </Link>
    </header>
  );
}
