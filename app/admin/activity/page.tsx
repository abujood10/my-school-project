"use client";

import { useEffect, useState } from "react";
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
        const res = await fetch("/api/admin/activity-logs");
        const data = await res.json();

        if (res.ok) {
          setLogs(data);
        }
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

      <div className="p-6 max-w-4xl mx-auto" dir="rtl">
        <h1 className="text-2xl font-bold mb-6">
          📜 سجل النشاط
        </h1>

        {loading && <p>⏳ جاري التحميل...</p>}

        {!loading && logs.length === 0 && (
          <p>لا توجد أنشطة مسجلة</p>
        )}

        {!loading &&
          logs.map((l) => (
            <div
              key={l.id}
              className="border-b py-4"
            >
              <div className="font-bold">
                {l.action}
              </div>

              <div className="text-gray-600">
                {l.description}
              </div>

              <div className="text-sm text-gray-400 mt-1">
                👤 {l.userName} ({l.role}) —{" "}
                {new Date(l.created).toLocaleString("ar-SA")}
              </div>
            </div>
          ))}
      </div>
    </>
  );
}