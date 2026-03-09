"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

type Student = {
  id: string;
  name: string;
};

export default function AttendancePage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [type, setType] = useState<"absent" | "late">("absent");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function loadStudents() {
      try {
        const res = await fetch("/api/attendance/init");
        const data = await res.json();
        if (!res.ok) return;

        setStudents(Array.isArray(data.students) ? data.students : []);
      } catch (e) {
        console.error(e);
      }
    }

    loadStudents();
  }, []);

  async function saveAttendance() {
    if (!selectedStudent) {
      setMsg("يرجى اختيار الطالب");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/attendance/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          type,
          reason,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "❌ حدث خطأ أثناء الحفظ");
        return;
      }

      setMsg("✅ تم تسجيل الحالة بنجاح");
      setReason("");
      setSelectedStudent("");
    } catch (e) {
      console.error(e);
      setMsg("❌ حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h2>📋 تسجيل غياب أو تأخير</h2>

        <div style={{ maxWidth: 500, display: "grid", gap: 12 }}>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            style={{ padding: 8 }}
          >
            <option value="">اختر الطالب</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as "absent" | "late")
            }
            style={{ padding: 8 }}
          >
            <option value="absent">غياب</option>
            <option value="late">تأخير</option>
          </select>

          <textarea
            placeholder="سبب (اختياري)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            style={{ padding: 8 }}
          />

          <button
            onClick={saveAttendance}
            disabled={loading}
            style={{
              padding: 10,
              background: "#d32f2f",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontWeight: 700,
            }}
          >
            {loading ? "جارٍ الحفظ..." : "حفظ"}
          </button>

          {msg && <div style={{ fontWeight: 600 }}>{msg}</div>}
        </div>
      </div>
    </>
  );
}