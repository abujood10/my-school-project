"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

type Student = {
  id: string;
  name: string;
};

type Behavior = {
  id: string;
  name: string;
  points: number;
  category: string;
};

export default function AssignBehaviorPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedBehavior, setSelectedBehavior] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/behavior/init");
        const data = await res.json();
        if (!res.ok) return;

        setStudents(data.students || []);
        setBehaviors(data.behaviors || []);
      } catch (e) {
        console.error("خطأ تحميل البيانات", e);
      }
    }

    loadData();
  }, []);

  async function assignBehavior() {
    if (!selectedStudent || !selectedBehavior) {
      setMsg("يرجى اختيار الطالب والسلوك");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/behavior/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          behaviorId: selectedBehavior,
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "❌ حدث خطأ أثناء التسجيل");
        return;
      }

      setMsg("✅ تم تسجيل السلوك (بانتظار الاعتماد)");
      setNote("");
      setSelectedStudent("");
      setSelectedBehavior("");
    } catch (e) {
      console.error("خطأ التسجيل", e);
      setMsg("❌ حدث خطأ أثناء التسجيل");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h2 style={{ marginBottom: 20 }}>
          ➕ تسجيل سلوك لطالب
        </h2>

        <div
          style={{
            maxWidth: 500,
            background: "#fff",
            padding: 20,
            borderRadius: 12,
            boxShadow: "0 4px 10px rgba(0,0,0,.05)",
            display: "grid",
            gap: 12,
          }}
        >
          <label>
            👦 اختر الطالب
            <select
              value={selectedStudent}
              onChange={(e) =>
                setSelectedStudent(e.target.value)
              }
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
              }}
            >
              <option value="">-- اختر --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            ⭐ اختر السلوك
            <select
              value={selectedBehavior}
              onChange={(e) =>
                setSelectedBehavior(e.target.value)
              }
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
              }}
            >
              <option value="">-- اختر --</option>
              {behaviors.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.points} نقطة)
                </option>
              ))}
            </select>
          </label>

          <label>
            📝 ملاحظة
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
              }}
            />
          </label>

          <button
            onClick={assignBehavior}
            disabled={loading}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "none",
              background: "#1976d2",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading
              ? "جارٍ التسجيل..."
              : "تسجيل السلوك"}
          </button>

          {msg && (
            <div
              style={{
                marginTop: 10,
                fontWeight: 600,
              }}
            >
              {msg}
            </div>
          )}
        </div>
      </div>
    </>
  );
}