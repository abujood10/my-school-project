"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import Header from "@/app/components/Header";

const pb = new PocketBase("http://127.0.0.1:8090");

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
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${pb.authStore.model?.id}"`);

      const links = await pb.collection("parents_students").getFullList({
        filter: `parent="${profile.id}"`,
        expand: "student",
      });

      const list = links.map((l: any) => ({
        id: l.expand.student.id,
        name: l.expand.student.name,
      }));

      setStudents(list);
      if (list.length > 0) setSelectedStudent(list[0].id);
    }

    loadStudents();
  }, []);

  useEffect(() => {
    async function loadLessons() {
      if (!selectedStudent) return;
      setLoading(true);

      const res = await pb.collection("lessons").getFullList<Lesson>({
        filter: `studentId="${selectedStudent}"`,
        sort: "day",
      });

      setLessons(res);
      setLoading(false);
    }

    loadLessons();
  }, [selectedStudent]);

  // ✅ دالة تحميل PDF
  async function downloadPdf() {
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
        {/* اختيار الطالب */}
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

        {/* زر تحميل PDF */}
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
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
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
