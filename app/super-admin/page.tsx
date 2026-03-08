"use client";

import { useEffect, useState } from "react";

type School = {
  id: string;
  name: string;
  subdomain: string;
  status: string;
  created: string;
};

export default function SuperAdminPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [subdomain, setSubdomain] = useState("");

  async function fetchSchools() {
    try {
      const res = await fetch("/api/schools");
      const data = await res.json();
      setSchools(data.items || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function createSchool() {
    if (!name || !subdomain) return;

    await fetch("/api/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        subdomain,
        status: "active",
      }),
    });

    setName("");
    setSubdomain("");
    fetchSchools();
  }

  useEffect(() => {
    fetchSchools();
  }, []);

  return (
    <div className="p-8 space-y-8">

      <h1 className="text-2xl font-bold">
        👑 إدارة المدارس
      </h1>

      {/* إضافة مدرسة */}
      <div className="bg-white p-6 rounded-xl shadow-md space-y-4 max-w-xl">

        <h2 className="font-semibold text-lg">إضافة مدرسة جديدة</h2>

        <input
          type="text"
          placeholder="اسم المدرسة"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="subdomain (مثال: school1)"
          value={subdomain}
          onChange={(e) => setSubdomain(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={createSchool}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          إنشاء المدرسة
        </button>
      </div>

      {/* عرض المدارس */}
      <div className="bg-white p-6 rounded-xl shadow-md">

        <h2 className="font-semibold text-lg mb-4">المدارس المسجلة</h2>

        {loading ? (
          <p>جاري التحميل...</p>
        ) : schools.length === 0 ? (
          <p>لا توجد مدارس حالياً</p>
        ) : (
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">المدرسة</th>
                <th className="p-2 border">Subdomain</th>
                <th className="p-2 border">الحالة</th>
                <th className="p-2 border">تاريخ الإنشاء</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id}>
                  <td className="p-2 border">{school.name}</td>
                  <td className="p-2 border">{school.subdomain}</td>
                  <td className="p-2 border">{school.status}</td>
                  <td className="p-2 border">
                    {new Date(school.created).toLocaleDateString("ar-SA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}