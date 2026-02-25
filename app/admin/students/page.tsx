"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import Header from "@/app/components/Header";

const pb = new PocketBase("http://127.0.0.1:8090");

type Student = {
  id: string;
  name: string;
  class: string;
};

export default function StudentsAdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [schoolId, setSchoolId] = useState<string>("");
  const [name, setName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // تحميل الطلاب
  useEffect(() => {
    async function loadStudents() {
      try {
        const profile = await pb
          .collection("profiles")
          .getFirstListItem(`user="${pb.authStore.model?.id}"`);

        setSchoolId(profile.schoolId);

        const list = await pb.collection("students").getFullList({
          filter: `schoolId="${profile.schoolId}"`,
          sort: "name",
        });

        const mapped = list.map((s: any) => ({
          id: s.id,
          name: s.name,
          class: s.class,
        }));

        setStudents(mapped);
      } catch (e) {
        console.error("خطأ تحميل الطلاب", e);
      }
    }

    loadStudents();
  }, []);

  // إضافة طالب
  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const student = await pb.collection("students").create({
        name,
        class: studentClass,
        schoolId,
      });

      setStudents((prev) => [
        ...prev,
        {
          id: student.id,
          name: student.name,
          class: student.class,
        },
      ]);

      setName("");
      setStudentClass("");
      setMsg("✅ تم إضافة الطالب");
    } catch (e: any) {
      setMsg(e.message || "❌ فشل إضافة الطالب");
    } finally {
      setLoading(false);
    }
  }

  // حذف طالب
  async function deleteStudent(id: string) {
    if (!confirm("هل أنت متأكد من حذف الطالب؟")) return;

    try {
      await pb.collection("students").delete(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert("فشل الحذف");
    }
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h1 style={{ marginBottom: 16 }}>👦 إدارة الطلاب</h1>

        {/* إضافة طالب */}
        <form
          onSubmit={addStudent}
          style={{
            background: "#fafafa",
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <h3>➕ إضافة طالب</h3>

          <input
            placeholder="اسم الطالب"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            placeholder="الصف / الفصل"
            value={studentClass}
            onChange={(e) => setStudentClass(e.target.value)}
            required
          />

          <button disabled={loading}>
            {loading ? "⏳ جاري الإضافة..." : "إضافة"}
          </button>

          {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
        </form>

        {/* قائمة الطلاب */}
        <h3>📋 قائمة الطلاب</h3>

        {students.length === 0 && <p>لا يوجد طلاب</p>}

        {students.map((s) => (
          <div
            key={s.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #eee",
              padding: "8px 0",
            }}
          >
            <div>
              <strong>{s.name}</strong>
              <div style={{ fontSize: 13, color: "#666" }}>
                الصف: {s.class}
              </div>
            </div>

            <button
              onClick={() => deleteStudent(s.id)}
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
