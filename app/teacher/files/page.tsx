"use client";

import { useState } from "react";

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
      if (!file) throw new Error("يرجى اختيار ملف");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("file", file);

      const res = await fetch("/api/teacher/files", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "فشل رفع الملف");
      }

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
    <div style={{ maxWidth: 500, margin: "40px auto" }} dir="rtl">
      <h2>رفع ملف</h2>

      <form onSubmit={handleUpload}>
        <input
          placeholder="عنوان الملف"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          style={{ display: "block", marginBottom: 10, width: "100%" }}
        />

        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
          style={{ display: "block", marginBottom: 10 }}
        />

        <button disabled={loading}>
          {loading ? "جاري الرفع..." : "رفع"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  );
}