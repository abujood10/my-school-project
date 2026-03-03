"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import Header from "@/app/components/Header";

const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

type Teacher = {
  id: string;
  name: string;
  email: string;
};

export default function TeachersAdminPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [schoolId, setSchoolId] = useState<string>("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // تحميل المعلمين
  useEffect(() => {
    async function loadTeachers() {
      try {
        const profile = await pb
          .collection("profiles")
          .getFirstListItem(`user="${pb.authStore.model?.id}"`);

        setSchoolId(profile.schoolId);

        const list = await pb.collection("profiles").getFullList({
          filter: `schoolId="${profile.schoolId}" && role="teacher"`,
        });

        const mapped = list.map((t: any) => ({
          id: t.id,
          name: t.name,
          email: t.email,
        }));

        setTeachers(mapped);
      } catch (e) {
        console.error("خطأ تحميل المعلمين", e);
      }
    }

    loadTeachers();
  }, []);

  // إضافة معلم
  async function addTeacher(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      // 1️⃣ إنشاء مستخدم
      const user = await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
      });

      // 2️⃣ إنشاء بروفايل المعلم
      const profile = await pb.collection("profiles").create({
        user: user.id,
        name,
        role: "teacher",
        schoolId,
      });

      setTeachers((prev) => [
        ...prev,
        { id: profile.id, name, email },
      ]);

      setName("");
      setEmail("");
      setPassword("");
      setMsg("✅ تم إضافة المعلم");
    } catch (e: any) {
      setMsg(e.message || "❌ فشل الإضافة");
    } finally {
      setLoading(false);
    }
  }

  // حذف معلم
  async function deleteTeacher(id: string) {
    if (!confirm("هل أنت متأكد من حذف المعلم؟")) return;

    try {
      await pb.collection("profiles").delete(id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert("فشل الحذف");
    }
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h1 style={{ marginBottom: 16 }}>👨‍🏫 إدارة المعلمين</h1>

        {/* إضافة معلم */}
        <form
          onSubmit={addTeacher}
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
            required
          />

          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button disabled={loading}>
            {loading ? "⏳ جاري الإضافة..." : "إضافة"}
          </button>

          {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
        </form>

        {/* قائمة المعلمين */}
        <h3>📋 قائمة المعلمين</h3>

        {teachers.length === 0 && <p>لا يوجد معلمون</p>}

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
              <strong>{t.name}</strong>
              <div style={{ fontSize: 13, color: "#666" }}>
                {t.email}
              </div>
            </div>

            <button
              onClick={() => deleteTeacher(t.id)}
              style={{
                background: "#ffecec",
                border: "1px solid #ffb3b3",
                borderRadius: 8,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              🗑️ حذف
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
