"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import Header from "@/app/components/Header";

const pb = new PocketBase("http://127.0.0.1:8090");

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
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${pb.authStore.model?.id}"`);

      setProfileId(profile.id);

      const res = await pb.collection("lessons").getFullList<Lesson>({
        filter: `schoolId="${profile.schoolId}"`,
        sort: "day",
      });

      setLessons(res);
      setLoading(false);
    }

    load();
  }, []);

  async function deleteLesson(id: string) {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await pb.collection("lessons").delete(id);
    setLessons((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h1>📘 دروسي</h1>

        {loading && <p>جاري التحميل...</p>}

        {!loading && lessons.length === 0 && (
          <p>لا توجد دروس</p>
        )}

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

              {/* الأزرار */}
              <div style={{ marginTop: 8 }}>
                {l.teacherId === profileId && (
                  <>
                    <button style={{ marginLeft: 8 }}>
                      ✏️ تعديل
                    </button>

                    <button
                      onClick={() => deleteLesson(l.id)}
                      style={{ color: "red" }}
                    >
                      🗑️ حذف
                    </button>
                  </>
                )}

                {l.teacherId !== profileId && (
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
