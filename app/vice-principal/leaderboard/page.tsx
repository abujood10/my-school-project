"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

type Student = {
  id: string;
  name: string;
  class: string;
  totalPoints?: number;
};

type LeaderboardResponse = {
  students?: Student[];
  message?: string;
};

export default function LeaderboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [classes, setClasses] = useState<string[]>([]);

  // تحميل الفصول
  useEffect(() => {
    async function loadClasses() {
      try {
        const res = await fetch("/api/leaderboard/classes");
        const data = await res.json();

        if (!res.ok) return;

        setClasses(Array.isArray(data.classes) ? data.classes : []);
      } catch (e) {
        console.error(e);
      }
    }

    loadClasses();
  }, []);

  async function loadLeaderboard() {
    if (!selectedClass) return;

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch(
        `/api/leaderboard?class=${encodeURIComponent(selectedClass)}`
      );

      const data: LeaderboardResponse = await res.json();

      if (!res.ok) {
        setMsg(data.message || "حدث خطأ أثناء تحميل الترتيب");
        return;
      }

      const sorted: Student[] = (data.students || [])
        .map((s: Student) => ({
          ...s,
          totalPoints: s.totalPoints || 0,
        }))
        .sort(
          (a: Student, b: Student) =>
            (b.totalPoints || 0) - (a.totalPoints || 0)
        );

      setStudents(sorted);
    } catch (e) {
      console.error(e);
      setMsg("حدث خطأ أثناء تحميل الترتيب");
    } finally {
      setLoading(false);
    }
  }

  async function generateCertificates() {
    if (students.length === 0) {
      setMsg("لا يوجد بيانات لإصدار الشهادات");
      return;
    }

    try {
      const res = await fetch(
        "/api/leaderboard/generate-certificates",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            className: selectedClass,
            topStudents: students.slice(0, 3),
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "حدث خطأ أثناء إصدار الشهادات");
        return;
      }

      setMsg("✅ تم إصدار شهادات الثلاثة الأوائل بنجاح");
    } catch (e) {
      console.error(e);
      setMsg("حدث خطأ أثناء إصدار الشهادات");
    }
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h2>🏆 ترتيب الطلاب حسب السلوك</h2>

        <div style={{ marginBottom: 16 }}>
          <label>اختر الفصل:</label>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ marginRight: 8, padding: 6 }}
          >
            <option value="">-- اختر الفصل --</option>

            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            onClick={loadLeaderboard}
            style={{
              marginRight: 8,
              padding: "6px 12px",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            عرض الترتيب
          </button>

          <button
            onClick={generateCertificates}
            style={{
              padding: "6px 12px",
              background: "#2e7d32",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            إصدار شهادات الثلاثة الأوائل
          </button>
        </div>

        {loading && <p>⏳ جاري التحميل...</p>}

        {msg && <p>{msg}</p>}

        {students.length > 0 && (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 16,
            }}
            border={1}
            cellPadding={8}
          >
            <thead>
              <tr>
                <th>الترتيب</th>
                <th>اسم الطالب</th>
                <th>المجموع الكلي</th>
              </tr>
            </thead>

            <tbody>
              {students.map((s, index) => (
                <tr key={s.id}>
                  <td>{index + 1}</td>
                  <td>{s.name}</td>
                  <td>{s.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}