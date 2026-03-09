"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  name: string;
  class: string;
};

export default function StudentsAdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      const res = await fetch("/api/admin/students");

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStudents(data.students);
    } catch (e: any) {
      console.error(e.message);
    } finally {
      setInitialLoading(false);
    }
  }

  async function addStudent(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          class: studentClass,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMsg("✅ تم إضافة الطالب");

      setName("");
      setStudentClass("");

      loadStudents();
    } catch (e: any) {
      setMsg(e.message || "❌ حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">إدارة الطلاب</h1>

      <form
        onSubmit={addStudent}
        className="border p-4 rounded mb-8"
      >
        <h2 className="font-bold mb-4">إضافة طالب</h2>

        <input
          type="text"
          className="border p-2 w-full mb-4 rounded"
          placeholder="اسم الطالب"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="text"
          className="border p-2 w-full mb-4 rounded"
          placeholder="الصف"
          value={studentClass}
          onChange={(e) => setStudentClass(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "جارٍ الإضافة..." : "إضافة الطالب"}
        </button>
      </form>

      <h2 className="font-bold mb-4">قائمة الطلاب</h2>

      {initialLoading && <p>جاري التحميل...</p>}

      {!initialLoading && (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-right">
                اسم الطالب
              </th>
              <th className="border p-2 text-right">
                الصف
              </th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td className="border p-2">{s.name}</td>
                <td className="border p-2">{s.class}</td>
              </tr>
            ))}

            {students.length === 0 && (
              <tr>
                <td
                  colSpan={2}
                  className="border p-4 text-center text-gray-500"
                >
                  لا يوجد طلاب بعد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {msg && (
        <p className="mt-4 font-semibold">{msg}</p>
      )}
    </div>
  );
}