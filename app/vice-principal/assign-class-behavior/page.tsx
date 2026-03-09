"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

type Student = {
  id: string;
  name: string;
  class: string;
};

type Behavior = {
  id: string;
  name: string;
  points: number;
};

export default function AssignClassBehaviorPage() {
  const [classes, setClasses] = useState<string[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedBehavior, setSelectedBehavior] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch("/api/behavior/class-init");
        const data = await res.json();
        if (!res.ok) return;

        const studentsData: Student[] = Array.isArray(data.students)
          ? data.students
          : [];

        const behaviorsData: Behavior[] = Array.isArray(data.behaviors)
          ? data.behaviors
          : [];

        setStudents(studentsData);
        setBehaviors(behaviorsData);

        const uniqueClasses = Array.from(
          new Set(studentsData.map((s) => s.class))
        );

        setClasses(uniqueClasses);
      } catch (e) {
        console.error(e);
      }
    }

    loadInitialData();
  }, []);

  async function assignToClass() {
    if (!selectedClass || !selectedBehavior) {
      setMsg("يرجى اختيار الفصل والسلوك");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/behavior/assign-class", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          className: selectedClass,
          behaviorId: selectedBehavior,
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "❌ حدث خطأ أثناء التسجيل");
        return;
      }

      setMsg(
        `✅ تم تسجيل السلوك لعدد ${data.count || 0} طالب`
      );
      setNote("");
    } catch (e) {
      console.error(e);
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
          👥 تسجيل سلوك لفصل كامل
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
            🏫 اختر الفصل
            <select
              value={selectedClass}
              onChange={(e) =>
                setSelectedClass(e.target.value)
              }
              style={{
                width: "100%",
                padding: 8,
                marginTop: 4,
              }}
            >
              <option value="">-- اختر --</option>
              {classes.map((c) => (
                <option key={c} value={c}>
                  {c}
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
            onClick={assignToClass}
            disabled={loading}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "none",
              background: "#388e3c",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {loading
              ? "جارٍ التسجيل..."
              : "تسجيل السلوك للفصل"}
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