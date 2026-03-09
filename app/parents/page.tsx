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

type BehaviorRecord = {
  id: string;
  points: number;
  note?: string;
  date: string;
  behaviorName?: string;
};

type AttendanceRecord = {
  id: string;
  type: "absent" | "late";
  date: string;
  note?: string;
};

const DAYS_LABEL: Record<string, string> = {
  sun: "الأحد",
  mon: "الإثنين",
  tue: "الثلاثاء",
  wed: "الأربعاء",
  thu: "الخميس",
};

const DAY_COLORS: Record<string, string> = {
  sun: "#E3F2FD",
  mon: "#E8F5E9",
  tue: "#FFFDE7",
  wed: "#F3E5F5",
  thu: "#FCE4EC",
};

export default function ParentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [behaviors, setBehaviors] = useState<BehaviorRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadStudents() {
      const res = await fetch("/api/parent/dashboard");
      const data = await res.json();
      if (!res.ok) return;

      setStudents(data.students || []);
      if (data.students?.length > 0) {
        setSelectedStudent(data.students[0].id);
      }
    }

    loadStudents();
  }, []);

  useEffect(() => {
    async function loadAll() {
      if (!selectedStudent) return;

      setLoading(true);

      const res = await fetch("/api/parent/student-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent }),
      });

      const data = await res.json();
      if (res.ok) {
        setLessons(data.lessons || []);
        setBehaviors(data.behaviors || []);
        setAttendance(data.attendance || []);
      }

      setLoading(false);
    }

    loadAll();
  }, [selectedStudent]);

  const totalPoints = behaviors.reduce((sum, b) => sum + (b.points || 0), 0);
  const totalAbsent = attendance.filter((a) => a.type === "absent").length;
  const totalLate = attendance.filter((a) => a.type === "late").length;

  const absenceLimit = 5;
  const exceededAbsence = totalAbsent >= absenceLimit;

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 700 }}>👦 اختر الطالب:</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            style={{ marginRight: 8, padding: "6px 10px", borderRadius: 8 }}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <h2>📘 الخطة الأسبوعية</h2>

        {loading && <p>⏳ جاري التحميل...</p>}

        <div style={{ display: "grid", gap: 16, marginBottom: 40 }}>
          {lessons.map((l) => (
            <div
              key={l.id}
              style={{
                background: DAY_COLORS[l.day],
                borderRadius: 14,
                padding: 16,
                boxShadow: "0 4px 10px rgba(0,0,0,.05)",
              }}
            >
              <strong>{DAYS_LABEL[l.day]}</strong>
              <div>🕒 {l.periods?.join(", ")}</div>
              <div>📘 {l.title}</div>
              <div>📝 {l.homework || "—"}</div>
              <div>ℹ️ {l.note || "—"}</div>
            </div>
          ))}
        </div>

        <h2>⭐ سجل السلوك</h2>

        <div
          style={{
            background: "#f5f5f5",
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          <strong>إجمالي النقاط:</strong> {totalPoints}
        </div>

        {behaviors.map((b) => (
          <div key={b.id} style={{ marginBottom: 8 }}>
            ⭐ {b.behaviorName || "سلوك"} — {b.points} نقطة
          </div>
        ))}

        <h2 style={{ marginTop: 40 }}>🚫 الحضور والانضباط</h2>

        {exceededAbsence && (
          <div
            style={{
              background: "#ffebee",
              color: "#b71c1c",
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
              fontWeight: 700,
            }}
          >
            ⚠️ تنبيه: تجاوز الطالب الحد المسموح للغياب ({absenceLimit} أيام)
          </div>
        )}

        <div style={{ marginBottom: 10 }}>
          ❌ أيام الغياب: <strong>{totalAbsent}</strong>
        </div>

        <div style={{ marginBottom: 20 }}>
          ⏰ مرات التأخير: <strong>{totalLate}</strong>
        </div>

        {attendance.map((a) => (
          <div key={a.id} style={{ marginBottom: 6 }}>
            {a.type === "absent" ? "❌ غياب" : "⏰ تأخير"} —{" "}
            {new Date(a.date).toLocaleDateString("ar-SA")}
            {a.note && ` — ${a.note}`}
          </div>
        ))}
      </div>
    </>
  );
}