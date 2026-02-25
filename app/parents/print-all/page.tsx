"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

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
        const profile = await pb
          .collection("profiles")
          .getFirstListItem(`user="${pb.authStore.model?.id}"`);

        const lessonsRes = await pb.collection("lessons").getFullList<Lesson>({
          filter: `schoolId="${profile.schoolId}"`,
          sort: "day",
        });

        const notifRes = await pb.collection("notifications").getFullList<Notification>({
          filter: `schoolId="${profile.schoolId}"`,
          sort: "-created",
        });

        setLessons(lessonsRes);
        setNotifications(notifRes.slice(0, 10)); // آخر 10 إشعارات
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) return <p>جاري التحضير للطباعة...</p>;

  return (
    <div style={{ padding: 30, direction: "rtl", fontFamily: "system-ui, Arial" }}>
      <h1 style={{ textAlign: "center" }}>📄 تقرير ولي الأمر</h1>

      {/* الخطة الأسبوعية */}
      <h2 style={{ marginTop: 24 }}>📘 الخطة الأسبوعية</h2>
      <table width="100%" border={1} cellPadding={8} style={{ borderCollapse: "collapse" }}>
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

      {/* الإشعارات */}
      <h2 style={{ marginTop: 32 }}>🔔 آخر الإشعارات</h2>
      <table width="100%" border={1} cellPadding={8} style={{ borderCollapse: "collapse" }}>
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
              <td>{new Date(n.created).toLocaleDateString("ar-SA")}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* زر الطباعة */}
      <div style={{ marginTop: 30, textAlign: "center" }}>
        <button
          onClick={() => window.print()}
          style={{ padding: "10px 20px", fontSize: 16, cursor: "pointer" }}
        >
          🖨️ طباعة / حفظ PDF
        </button>
      </div>

      {/* تحسين الطباعة */}
      <style jsx>{`
        @media print {
          button {
            display: none;
          }
          body {
            background: white;
          }
        }
      `}</style>
    </div>
  );
}
