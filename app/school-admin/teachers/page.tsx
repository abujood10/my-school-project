"use client";

import { useEffect, useState } from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();


type Teacher = {
  id: string;
  name: string;
  email: string;
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadTeachers() {
    const profile = await pb
      .collection("profiles")
      .getFirstListItem(`user="${pb.authStore.model?.id}"`);

    const res = await pb.collection("profiles").getFullList({
      filter: `schoolId="${profile.schoolId}" && role="teacher"`,
      sort: "created",
    });

    setTeachers(
      res.map((t) => ({
        id: t.id,
        name: t.name,
        email: t.expand?.user?.email || "",
      }))
    );
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  async function createTeacher(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const adminProfile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${pb.authStore.model?.id}"`);

      // 1️⃣ إنشاء مستخدم
      const user = await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
      });

      // 2️⃣ إنشاء profile
      await pb.collection("profiles").create({
        user: user.id,
        name,
        role: "teacher",
        schoolId: adminProfile.schoolId,
      });

      setName("");
      setEmail("");
      setPassword("");
      loadTeachers();
    } catch (err: any) {
      alert(err.message || "فشل إضافة المعلم");
    } finally {
      setLoading(false);
    }
  }

  async function deleteTeacher(id: string) {
    if (!confirm("هل أنت متأكد من حذف المعلم؟")) return;

    try {
      const profile = await pb.collection("profiles").getOne(id);
      await pb.collection("users").delete(profile.user);
      loadTeachers();
    } catch {
      alert("فشل الحذف");
    }
  }

  return (
    <div style={{ padding: 30 }}>
      <h1>إدارة المعلمين</h1>

      {/* إضافة معلم */}
      <form onSubmit={createTeacher} style={{ marginTop: 20 }}>
        <h3>إضافة معلم جديد</h3>

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
          {loading ? "جاري الإضافة..." : "إضافة"}
        </button>
      </form>

      {/* جدول المعلمين */}
      <table
        style={{
          width: "100%",
          marginTop: 40,
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th align="right">الاسم</th>
            <th align="right">البريد</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {teachers.map((t) => (
            <tr key={t.id}>
              <td>{t.name}</td>
              <td>{t.email}</td>
              <td>
                <button onClick={() => deleteTeacher(t.id)}>🗑 حذف</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
