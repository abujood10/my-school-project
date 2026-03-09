"use client";

import { useEffect, useState } from "react";

type Lesson = {
  id: string;
  title: string;
  homework?: string;
  note?: string;
  day: string;
  periods: number[];
};

type Notification = {
  id: string;
  title: string;
  body: string;
  created: string;
};

const DAYS_LABEL: Record<string, string> = {
  sun: "الأحد",
  mon: "الإثنين",
  tue: "الثلاثاء",
  wed: "الأربعاء",
  thu: "الخميس",
};

export default function PrintAllPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/parent/print-all");
        const data = await res.json();
        if (!res.ok) return;

        setLessons(data.lessons || []);
        setNotifications(data.notifications || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>جاري التحضير للطباعة...</p>;

  return (
    <div
      style={{
        padding: 30,
        direction: "rtl",
        fontFamily: "system-ui, Arial",
      }}
    >
      <h1 style={{ textAlign: "center" }}>
        📄 تقرير ولي الأمر
      </h1>

      <h2 style={{ marginTop: 24 }}>
        📘 الخطة الأسبوعية
      </h2>

      <table
        width="100%"
        border={1}
        cellPadding={8}
        style={{ borderCollapse: "collapse" }}
      >
        <thead style={{ background: "#f0f0f0" }}>
          <tr>
            <th>اليوم</th>
            <th>الحصص</th>
            <th>الدرس</th>
            <th>الواجب</th>
            <th>ملاحظة</th>
          </tr>
        </thead>

        <tbody>
          {lessons.map((l) => (
            <tr key={l.id}>
              <td>{DAYS_LABEL[l.day]}</td>
              <td>{l.periods.join(", ")}</td>
              <td>{l.title}</td>
              <td>{l.homework || "—"}</td>
              <td>{l.note || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 32 }}>
        🔔 آخر الإشعارات
      </h2>

      <table
        width="100%"
        border={1}
        cellPadding={8}
        style={{ borderCollapse: "collapse" }}
      >
        <thead style={{ background: "#f0f0f0" }}>
          <tr>
            <th>العنوان</th>
            <th>المحتوى</th>
            <th>التاريخ</th>
          </tr>
        </thead>

        <tbody>
          {notifications.map((n) => (
            <tr key={n.id}>
              <td>{n.title}</td>
              <td>{n.body}</td>
              <td>
                {new Date(n.created).toLocaleDateString("ar-SA")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ marginTop: 30, textAlign: "center" }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: "10px 20px",
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          🖨️ طباعة / حفظ PDF
        </button>
      </div>

      <style jsx>{`
        @media print {
          button {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}