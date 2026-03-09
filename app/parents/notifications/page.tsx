"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

type Student = {
  id: string;
  name: string;
};

type Lesson = {
  id: string;
  title: string;
  homework?: string;
  note?: string;
  day: string;
  periods: number[];
};

const DAYS_LABEL: Record<string, string> = {
  sun: "الأحد",
  mon: "الإثنين",
  tue: "الثلاثاء",
  wed: "الأربعاء",
  thu: "الخميس",
};

export default function ParentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch("/api/parent/students");
        const data = await res.json();
        if (!res.ok) return;

        setStudents(data.students);

        if (data.students.length > 0) {
          setSelectedStudent(data.students[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadStudents();
  }, []);

  useEffect(() => {
    async function loadLessons() {
      if (!selectedStudent) return;
      setLoading(true);

      try {
        const res = await fetch(
          `/api/parent/weekly-plan?studentId=${selectedStudent}`
        );
        const data = await res.json();
        if (!res.ok) return;

        setLessons(data.lessons);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, [selectedStudent]);

  async function downloadPdf() {
    if (!selectedStudent) return;

    const res = await fetch("/api/pdf/weekly-plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: selectedStudent }),
    });

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "weekly-plan.pdf";
    a.click();

    window.URL.revokeObjectURL(url);
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <div style={{ marginBottom: 16 }}>
          <label>👦 اختر الطالب:</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            style={{ marginRight: 8 }}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <button onClick={downloadPdf} style={{ marginBottom: 20 }}>
          🖨️ تحميل الخطة الأسبوعية PDF
        </button>

        <h1>📘 الخطة الأسبوعية</h1>

        {loading && <p>جاري التحميل...</p>}

        {!loading && lessons.length === 0 && (
          <p>لا توجد دروس لهذا الطالب</p>
        )}

        {!loading && lessons.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
            }}
          >
            {lessons.map((l) => (
              <div
                key={l.id}
                style={{
                  border: "1px solid #e5e5e5",
                  borderRadius: 12,
                  padding: 16,
                  background: "#fafafa",
                }}
              >
                <strong>{DAYS_LABEL[l.day]}</strong>
                <div>🕒 حصص: {l.periods.join(", ")}</div>
                <div>📘 {l.title}</div>
                <div>📝 {l.homework || "—"}</div>
                <div>ℹ️ {l.note || "—"}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}