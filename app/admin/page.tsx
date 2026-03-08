"use client";

import { useEffect, useState } from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();
import Header from "@/app/components/Header";



type Stats = {
  students: number;
  teachers: number;
  lessons: number;
};

export default function SchoolAdminDashboard() {
  const [schoolName, setSchoolName] = useState("");
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats>({
    students: 0,
    teachers: 0,
    lessons: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const profile = await pb
          .collection("profiles")
          .getFirstListItem(`user="${pb.authStore.model?.id}"`, {
            expand: "schoolId",
          });

        const school = profile.expand?.schoolId;
        if (!school) return;

        setSchoolName(school.name);
        setExpiresAt(school.expiresAt || null);

        const students = await pb.collection("students").getFullList({
          filter: `schoolId="${school.id}"`,
        });

        const teachers = await pb.collection("profiles").getFullList({
          filter: `schoolId="${school.id}" && role="teacher"`,
        });

        const lessons = await pb.collection("lessons").getFullList({
          filter: `schoolId="${school.id}"`,
        });

        setStats({
          students: students.length,
          teachers: teachers.length,
          lessons: lessons.length,
        });
      } catch (e) {
        console.error("Dashboard error", e);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const isExpiringSoon =
    expiresAt &&
    new Date(expiresAt).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 14;

  return (
    <>
      <Header />
      <div style={{ padding: 24 }} dir="rtl">
        <h1 style={{ marginBottom: 8 }}>📊 لوحة تحكم المدرسة</h1>
        <p style={{ color: "#555", marginBottom: 20 }}>🏫 {schoolName}</p>

        {isExpiringSoon && (
          <div
            style={{
              background: "#FFF3CD",
              padding: 12,
              borderRadius: 10,
              marginBottom: 20,
              border: "1px solid #FFECB5",
            }}
          >
            ⚠️ تنبيه: اشتراك المدرسة سينتهي قريبًا
          </div>
        )}

        {loading ? (
          <p>⏳ جاري التحميل...</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 16,
            }}
          >
            <StatCard title="👦 الطلاب" value={stats.students} />
            <StatCard title="👨‍🏫 المعلمون" value={stats.teachers} />
            <StatCard title="📘 الدروس" value={stats.lessons} />
          </div>
        )}
      </div>
    </>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div
      style={{
        background: "#fafafa",
        border: "1px solid #e5e5e5",
        borderRadius: 14,
        padding: 20,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 16, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 900 }}>{value}</div>
    </div>
  );
}