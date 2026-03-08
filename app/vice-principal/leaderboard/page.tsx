"use client";

import { useEffect, useState } from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();
import Header from "@/app/components/Header";



type Student = {
  id: string;
  name: string;
  class: string;
  totalPoints?: number;
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
      const res = await pb.collection("students").getFullList<Student>();
      const uniqueClasses = Array.from(
        new Set(res.map((s) => s.class).filter(Boolean))
      );
      setClasses(uniqueClasses);
    }

    loadClasses();
  }, []);

  async function loadLeaderboard() {
    if (!selectedClass) return;

    setLoading(true);
    setMsg("");

    try {
      const res = await pb.collection("students").getFullList<Student>({
        filter: `class="${selectedClass}"`,
      });

      const sorted = res
        .map((s) => ({
          ...s,
          totalPoints: s.totalPoints || 0,
        }))
        .sort((a, b) => b.totalPoints! - a.totalPoints!);

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
      const certificateId = crypto.randomUUID();

      for (let i = 0; i < Math.min(3, students.length); i++) {
        const student = students[i];

        await pb.collection("certificates").create({
          student: student.id,
          class: selectedClass,
          position: i + 1,
          totalPoints: student.totalPoints,
          certificateId,
          createdAt: new Date().toISOString(), // ✅ تم التعديل هنا
        });
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
