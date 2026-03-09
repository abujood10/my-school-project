"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

type Teacher = {
  id: string;
  name: string;
  email: string;
};

export default function TeachersAdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadTeachers();
  }, []);

  async function loadTeachers() {
    try {
      const res = await fetch("/api/admin/teachers");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setTeachers(data.teachers);
    } catch (e: any) {
      console.error(e.message);
    }
  }

  async function createTeacher(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMsg("✅ تم إضافة المعلم");
      setName("");
      setEmail("");
      setPassword("");
      setTeachers(data.teachers);

    } catch (e: any) {
      setMsg(e.message || "❌ فشل الإضافة");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTeacher(id: string) {
    if (!confirm("هل أنت متأكد من حذف المعلم؟")) return;

    try {
      const res = await fetch(`/api/admin/teachers?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setTeachers(data.teachers);
    } catch (e: any) {
      alert(e.message || "فشل الحذف");
    }
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h1 style={{ marginBottom: 16 }}>👨‍🏫 إدارة المعلمين</h1>

        <form
          onSubmit={createTeacher}
          style={{
            background: "#fafafa",
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <h3>➕ إضافة معلم</h3>

          <input
            placeholder="اسم المعلم"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
            required
          />

          <input
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            required
          />

          <input
            placeholder="كلمة المرور"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
            required
          />

          <button disabled={loading} style={btnStyle}>
            {loading ? "جاري الإضافة..." : "إضافة"}
          </button>

          {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
        </form>

        <h3>📋 قائمة المعلمين</h3>

        {teachers.length === 0 && <p>لا يوجد معلمين</p>}

        {teachers.map((t) => (
          <div
            key={t.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #eee",
              padding: "8px 0",
            }}
          >
            <div>
              👤 <strong>{t.name}</strong> — {t.email}
            </div>

            <button
              onClick={() => deleteTeacher(t.id)}
              style={deleteBtnStyle}
            >
              ❌ حذف
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
};

const btnStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  background: "#000",
  color: "#fff",
  cursor: "pointer",
};

const deleteBtnStyle: React.CSSProperties = {
  background: "#ffecec",
  border: "1px solid #ffb3b3",
  borderRadius: 8,
  padding: "6px 10px",
  cursor: "pointer",
};