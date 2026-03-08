"use client";

import { useState } from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();



export default function TeacherFilesPage() {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // المستخدم الحالي
      const user = pb.authStore.model;
      if (!user) throw new Error("غير مسجل دخول");

      // جلب الـ profile
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${user.id}"`);

      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file!);
      formData.append("schoolId", profile.schoolId);
      formData.append("teacherId", profile.id);

      await pb.collection("files").create(formData);

      setMsg("✅ تم رفع الملف بنجاح");
      setTitle("");
      setFile(null);
    } catch (err: any) {
      setMsg(err.message || "❌ فشل رفع الملف");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h2>رفع ملف</h2>

      <form onSubmit={handleUpload}>
        <input
          placeholder="عنوان الملف"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />

        <button disabled={loading}>
          {loading ? "جاري الرفع..." : "رفع"}
        </button>
      </form>

      {msg && <p>{msg}</p>}
    </div>
  );
}
