"use client";

import { useEffect, useState } from "react";

type Student = {
  id: string;
  name: string;
  class: string;
};

type ApiResponse = {
  students?: Student[];
  message?: string;
};

export default function StudentsAdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  const [name, setName] = useState("");
  const [studentClass, setStudentClass] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();

    setFilteredStudents(
      students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.class.toLowerCase().includes(q)
      )
    );
  }, [search, students]);

  async function loadStudents() {
    try {
      const res = await fetch("/api/admin/students");

      const data: ApiResponse = await res.json();

      if (!res.ok) throw new Error(data.message);

      setStudents(data.students || []);
      setFilteredStudents(data.students || []);
    } catch (e: any) {
      setMsg("❌ فشل تحميل الطلاب");
    } finally {
      setInitialLoading(false);
    }
  }

  async function addOrUpdateStudent(e: React.FormEvent) {
    e.preventDefault();

    if (!name || !studentClass) {
      setMsg("يرجى إدخال جميع البيانات");
      return;
    }

    setLoading(true);
    setMsg("");

    try {
      const url = editingId
        ? `/api/admin/students/${editingId}`
        : "/api/admin/students";

      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
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

      setMsg(
        editingId
          ? "✅ تم تعديل الطالب"
          : "✅ تم إضافة الطالب"
      );

      setName("");
      setStudentClass("");
      setEditingId(null);

      loadStudents();
    } catch (e: any) {
      setMsg(e.message || "❌ حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  function editStudent(student: Student) {
    setName(student.name);
    setStudentClass(student.class);
    setEditingId(student.id);
  }

  async function deleteStudent(id: string) {
    if (!confirm("هل تريد حذف الطالب؟")) return;

    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setMsg("🗑 تم حذف الطالب");

      loadStudents();
    } catch (e: any) {
      setMsg(e.message || "❌ فشل الحذف");
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">
        إدارة الطلاب
      </h1>

      {/* البحث */}
      <input
        type="text"
        placeholder="🔎 بحث عن طالب..."
        className="border p-2 w-full mb-6 rounded"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* نموذج الإضافة */}
      <form
        onSubmit={addOrUpdateStudent}
        className="border p-4 rounded mb-8"
      >
        <h2 className="font-bold mb-4">
          {editingId ? "تعديل طالب" : "إضافة طالب"}
        </h2>

        <input
          type="text"
          className="border p-2 w-full mb-4 rounded"
          placeholder="اسم الطالب"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          className="border p-2 w-full mb-4 rounded"
          placeholder="الفصل"
          value={studentClass}
          onChange={(e) =>
            setStudentClass(e.target.value)
          }
        />

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          {loading
            ? "جارٍ المعالجة..."
            : editingId
            ? "تحديث"
            : "إضافة"}
        </button>
      </form>

      {/* جدول الطلاب */}

      {initialLoading && <p>جاري التحميل...</p>}

      {!initialLoading && (
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">الاسم</th>
              <th className="border p-2">الفصل</th>
              <th className="border p-2">الإجراءات</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s.id}>
                <td className="border p-2">{s.name}</td>

                <td className="border p-2">{s.class}</td>

                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => editStudent(s)}
                    className="bg-blue-500 text-white px-2 py-1 rounded"
                  >
                    تعديل
                  </button>

                  <button
                    onClick={() =>
                      deleteStudent(s.id)
                    }
                    className="bg-red-600 text-white px-2 py-1 rounded"
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}

            {filteredStudents.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="border p-4 text-center text-gray-500"
                >
                  لا يوجد طلاب
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {msg && (
        <p className="mt-4 font-semibold">
          {msg}
        </p>
      )}
    </div>
  );
}