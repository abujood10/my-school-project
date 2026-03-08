"use client";

import { useEffect, useState } from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();
import Header from "@/app/components/Header";



type Log = {
  id: string;
  action: string;
  description: string;
  userName: string;
  role: string;
  created: string;
};

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        // جلب بروفايل المدير + المدرسة
        const profile = await pb
          .collection("profiles")
          .getFirstListItem(`user="${pb.authStore.model?.id}"`);

        // جلب السجل الخاص بالمدرسة فقط
        const list = await pb.collection("activity_logs").getFullList<Log>({
          filter: `schoolId="${profile.schoolId}"`,
          sort: "-created",
        });

        setLogs(list);
      } catch (e) {
        console.error("خطأ تحميل سجل النشاط", e);
      } finally {
        setLoading(false);
      }
    }

    loadLogs();
  }, []);

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h1 style={{ marginBottom: 16 }}>📜 سجل النشاط</h1>

        {loading && <p>⏳ جاري التحميل...</p>}

        {!loading && logs.length === 0 && (
          <p>لا توجد أنشطة مسجلة حتى الآن</p>
        )}

        {!loading && logs.length > 0 && (
          <div
            style={{
              border: "1px solid #e5e5e5",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            {logs.map((l) => (
              <div
                key={l.id}
                style={{
                  borderBottom: "1px solid #eee",
                  padding: 12,
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  🏷️ {formatAction(l.action)}
                </div>

                <div style={{ marginTop: 4 }}>
                  {l.description}
                </div>

                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: "#666",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    👤 {l.userName} ({l.role})
                  </span>
                  <span>
                    🕒 {new Date(l.created).toLocaleString("ar-SA")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

// تحويل الأكشن إلى نص مفهوم
function formatAction(action: string) {
  switch (action) {
    case "add_student":
      return "إضافة طالب";
    case "delete_student":
      return "حذف طالب";
    case "add_teacher":
      return "إضافة معلم";
    case "delete_teacher":
      return "حذف معلم";
    case "link_parent_student":
      return "ربط ولي أمر بطالب";
    case "unlink_parent_student":
      return "فك ربط ولي أمر";
    default:
      return action;
  }
}
