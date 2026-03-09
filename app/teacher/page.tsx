"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

type Lesson = {
  id: string;
  title: string;
  day: string;
  periods: number[];
  teacherId: string;
};

export default function TeacherPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileId, setProfileId] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/teacher/lessons");
        const data = await res.json();
        if (!res.ok) return;

        setProfileId(data.profileId);
        setLessons(data.lessons || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function deleteLesson(id: string) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;

    try {
      const res = await fetch(`/api/teacher/lessons/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("فشل الحذف");
        return;
      }

      setLessons((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error(err);
      alert("فشل الحذف");
    }
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h1>📘 دروسي</h1>

        {loading && <p>جاري التحميل...</p>}

        {!loading && lessons.length === 0 && <p>لا توجد دروس</p>}

        {!loading &&
          lessons.map((l) => (
            <div
              key={l.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <strong>{l.title}</strong>
              <div>🕒 حصص: {l.periods.join(", ")}</div>

              <div style={{ marginTop: 8 }}>
                {l.teacherId === profileId ? (
                  <>
                    <button style={{ marginLeft: 8 }}>✏️ تعديل</button>

                    <button
                      onClick={() => deleteLesson(l.id)}
                      style={{ color: "red" }}
                    >
                      🗑️ حذف
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: "#777" }}>
                    🔒 لا يمكنك تعديل هذا الدرس
                  </span>
                )}
              </div>
            </div>
          ))}
      </div>
    </>
  );
}