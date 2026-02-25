"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

export default function UploadFilePage() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [lessonId, setLessonId] = useState("");
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function loadLessons() {
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${pb.authStore.model?.id}"`);

      const res = await pb.collection("lessons").getFullList({
        filter: `schoolId="${profile.schoolId}"`,
        sort: "day",
      });

      setLessons(res);
    }

    loadLessons();
  }, []);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setMsg("");

    try {
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${pb.authStore.model?.id}"`);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);
      formData.append("schoolId", profile.schoolId);
      formData.append("teacherId", profile.id);
      if (lessonId) formData.append("lessonId", lessonId);

      await pb.collection("files").create(formData);

      setMsg("✅ تم رفع الملف وربطه بالدرس");
      setTitle("");
      setFile(null);
      setLessonId("");
    } catch (err: any) {
      setMsg(err.message || "❌ فشل الرفع");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto" }}>
      <h2>رفع ملف مرتبط بالدرس</h2>

      <form onSubmit={handleUpload}>
        <input
          placeholder="عنوان الملف"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <select value={lessonId} onChange={(e) => setLessonId(e.target.value)}>
          <option value="">— اختر الدرس (اختياري) —</option>
          {lessons.map((l) => (
            <option key={l.id} value={l.id}>
              {l.title} ({l.day} | حصص {l.periods.join(",")})
            </option>
          ))}
        </select>

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />

        <button disabled={loading}>
          {loading ? "جارٍ الرفع..." : "رفع"}
        </button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
