"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

type School = {
  id: string;
  name: string;
  status: string;
  expiresAt?: string;
  expand?: {
    plan?: {
      name: string;
    };
  };
};

export default function SuperAdminPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [name, setName] = useState("");
  const [planId, setPlanId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSchools();
  }, []);

  async function loadSchools() {
    const res = await fetch("/api/super-admin/schools");
    const data = await res.json();
    if (res.ok) setSchools(data);
  }

  async function createSchool(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/super-admin/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, planId, expiresAt }),
    });

    if (res.ok) {
      setName("");
      setPlanId("");
      setExpiresAt("");
      loadSchools();
    }

    setLoading(false);
  }

  async function toggleSchool(id: string, current: string) {
    const newStatus =
      current === "active" ? "suspended" : "active";

    await fetch("/api/super-admin/toggle-school", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolId: id,
        status: newStatus,
      }),
    });

    loadSchools();
  }

  return (
    <>
      <Header />

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">
          👑 لوحة تحكم المشرف العام
        </h1>

        {/* إنشاء مدرسة */}
        <form
          onSubmit={createSchool}
          className="bg-gray-100 p-6 rounded-xl mb-10"
        >
          <h3 className="mb-4 font-bold">
            ➕ إضافة مدرسة جديدة
          </h3>

          <input
            placeholder="اسم المدرسة"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 mr-2"
            required
          />

          <input
            placeholder="Plan ID"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="border p-2 mr-2"
            required
          />

          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            className="border p-2 mr-2"
          />

          <button
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded"
          >
            {loading ? "جاري الإنشاء..." : "إنشاء"}
          </button>
        </form>

        {/* قائمة المدارس */}
        <div className="grid gap-6">
          {schools.map((s) => (
            <div
              key={s.id}
              className="border p-6 rounded-xl flex justify-between"
            >
              <div>
                <h3 className="font-bold text-lg">
                  {s.name}
                </h3>
                <p>الحالة: {s.status}</p>
                <p>
                  الباقة: {s.expand?.plan?.name || "-"}
                </p>
                <p>
                  انتهاء الاشتراك:{" "}
                  {s.expiresAt
                    ? new Date(
                        s.expiresAt
                      ).toLocaleDateString("ar-SA")
                    : "-"}
                </p>
              </div>

              <button
                onClick={() =>
                  toggleSchool(s.id, s.status)
                }
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                {s.status === "active"
                  ? "تعليق"
                  : "تفعيل"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}