"use client";

import { useState } from "react";

export default function TeacherLessonsPage() {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("");
  const [periodsInput, setPeriodsInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function saveLesson(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const periods = periodsInput
        .split(",")
        .map((n) => Number(n.trim()))
        .filter((n) => !isNaN(n));

      const res = await fetch("/api/teacher/lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          day,
          periods,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "❌ حدث خطأ");
        return;
      }

      alert("✅ تم حفظ الدرس وإرسال الإشعارات");

      setTitle("");
      setDay("");
      setPeriodsInput("");
    } catch (err) {
      console.error(err);
      alert("❌ حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }} dir="rtl">
      <form onSubmit={saveLesson}>
        <h2>إضافة درس</h2>

        <input
          placeholder="عنوان الدرس"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10, width: "100%" }}
        />

        <input
          placeholder="اليوم (sun, mon, tue...)"
          value={day}
          onChange={(e) => setDay(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10, width: "100%" }}
        />

        <input
          placeholder="الحصص (مثال: 1,2)"
          value={periodsInput}
          onChange={(e) => setPeriodsInput(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10, width: "100%" }}
        />

        <button disabled={loading}>
          {loading ? "..." : "حفظ الدرس"}
        </button>
      </form>
    </div>
  );
}