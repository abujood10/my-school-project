"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";

type Plan = {
  id: string;
  name: string;
  price: number;
  maxStudents: number;
  maxTeachers: number;
  durationDays: number;
};

type School = {
  id: string;
  name: string;
  status: string;
  expiresAt?: string;
  customPrice?: number;
  customMaxStudents?: number;
  customMaxTeachers?: number;
  customDurationDays?: number;
  expand?: {
    plan?: Plan;
  };
};

export default function SuperAdminSchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const plansRes = await pb.collection("plans").getFullList<Plan>();
    const schoolsRes = await pb.collection("schools").getFullList<School>({
      expand: "plan",
    });

    setPlans(plansRes);
    setSchools(schoolsRes);
  }

  async function updateSchool() {
    if (!selectedSchool) return;

    setLoading(true);

    try {
      const plan = selectedSchool.expand?.plan;

      const duration =
        selectedSchool.customDurationDays ??
        plan?.durationDays ??
        30;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration);

      await pb.collection("schools").update(selectedSchool.id, {
        customPrice: selectedSchool.customPrice || null,
        customMaxStudents: selectedSchool.customMaxStudents || null,
        customMaxTeachers: selectedSchool.customMaxTeachers || null,
        customDurationDays: selectedSchool.customDurationDays || null,
        status: "active",
        expiresAt,
      });

      alert("تم تحديث المدرسة بنجاح");
      setSelectedSchool(null);
      loadData();
    } catch (e) {
      alert("حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  async function suspendSchool(id: string) {
    await pb.collection("schools").update(id, {
      status: "suspended",
    });

    loadData();
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        👑 إدارة المدارس
      </h1>

      <table className="w-full border text-sm mb-8">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2 text-right">المدرسة</th>
            <th className="border p-2 text-right">الباقة</th>
            <th className="border p-2">الحالة</th>
            <th className="border p-2">إجراءات</th>
          </tr>
        </thead>
        <tbody>
          {schools.map((s) => (
            <tr key={s.id}>
              <td className="border p-2">{s.name}</td>
              <td className="border p-2">
                {s.expand?.plan?.name || "-"}
              </td>
              <td className="border p-2 text-center">
                {s.status}
              </td>
              <td className="border p-2 text-center space-x-2">
                <button
                  onClick={() => setSelectedSchool(s)}
                  className="bg-blue-600 text-white px-2 py-1 rounded"
                >
                  تعديل
                </button>

                <button
                  onClick={() => suspendSchool(s.id)}
                  className="bg-red-600 text-white px-2 py-1 rounded"
                >
                  إيقاف
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedSchool && (
        <div className="border p-6 rounded bg-white">
          <h2 className="font-bold mb-4">
            تخصيص باقة: {selectedSchool.name}
          </h2>

          <div className="grid gap-3">

            <input
              type="number"
              placeholder="سعر مخصص"
              className="border p-2 rounded"
              value={selectedSchool.customPrice || ""}
              onChange={(e) =>
                setSelectedSchool({
                  ...selectedSchool,
                  customPrice: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              placeholder="حد الطلاب"
              className="border p-2 rounded"
              value={selectedSchool.customMaxStudents || ""}
              onChange={(e) =>
                setSelectedSchool({
                  ...selectedSchool,
                  customMaxStudents: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              placeholder="حد المعلمين"
              className="border p-2 rounded"
              value={selectedSchool.customMaxTeachers || ""}
              onChange={(e) =>
                setSelectedSchool({
                  ...selectedSchool,
                  customMaxTeachers: Number(e.target.value),
                })
              }
            />

            <input
              type="number"
              placeholder="مدة الاشتراك (أيام)"
              className="border p-2 rounded"
              value={selectedSchool.customDurationDays || ""}
              onChange={(e) =>
                setSelectedSchool({
                  ...selectedSchool,
                  customDurationDays: Number(e.target.value),
                })
              }
            />

            <button
              onClick={updateSchool}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {loading ? "جارٍ الحفظ..." : "حفظ وتفعيل"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}