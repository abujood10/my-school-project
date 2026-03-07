"use client";

import { useEffect, useState } from "react";

type ClassType = {
  id: string;
  name: string;
};

type Student = {
  id: string;
  name: string;
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [className, setClassName] = useState("");
  const [studentName, setStudentName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    const res = await fetch("/api/students");
    const data = await res.json();
    if (res.ok) {
      setStudents(data);
    }
  }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();

    if (!studentName) {
      alert("أدخل اسم الطالب");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: studentName,
        classId: selectedClass || null,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "حدث خطأ");
    } else {
      alert("✅ تمت إضافة الطالب بنجاح");
      setStudentName("");
      setSelectedClass("");
      loadStudents();
    }

    setLoading(false);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        إدارة الطلاب
      </h1>

      <form onSubmit={handleAddStudent} className="border p-4 rounded mb-8">
        <h2 className="font-bold mb-4">إضافة طالب</h2>

        <input
          type="text"
          className="border p-2 w-full mb-4 rounded"
          placeholder="اسم الطالب"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
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

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-right">
              اسم الطالب
            </th>
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr key={s.id}>
              <td className="border p-2">{s.name}</td>
            </tr>
          ))}

          {students.length === 0 && (
            <tr>
              <td className="border p-4 text-center text-gray-500">
                لا يوجد طلاب بعد
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}