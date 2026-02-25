"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";

type ClassType = {
  id: string;
  name: string;
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [studentName, setStudentName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);

  const [planName, setPlanName] = useState("");
  const [maxStudents, setMaxStudents] = useState(0);
  const [currentStudents, setCurrentStudents] = useState(0);

  const [schoolId, setSchoolId] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    try {
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(
          `user="${pb.authStore.model?.id}"`,
          { expand: "schoolId,schoolId.plan" }
        );

      const school: any = profile.expand?.schoolId;
      const plan: any = school?.expand?.plan;

      if (!school) return;

      setSchoolId(school.id);

      if (plan) {
        setPlanName(plan.name);
        setMaxStudents(plan.maxStudents);
      }

      // عدد الطلاب الحالي
      const studentsRes = await pb.collection("students").getList(1, 1, {
        filter: `schoolId="${school.id}"`,
      });

      setCurrentStudents(studentsRes.totalItems);

      // تحميل الفصول
      const classesRes = await pb.collection("classes").getFullList<ClassType>({
        filter: `schoolId="${school.id}"`,
        sort: "name",
      });

      setClasses(classesRes);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleAddStudent(e: React.FormEvent) {
    e.preventDefault();

    if (!studentName || !selectedClass) {
      alert("أدخل اسم الطالب واختر الفصل");
      return;
    }

    if (currentStudents >= maxStudents) {
      alert("❌ تم تجاوز الحد الأقصى للطلاب في باقتك");
      return;
    }

    try {
      setLoading(true);

      await pb.collection("students").create({
        name: studentName,
        schoolId: schoolId,
        classId: selectedClass,
        totalPoints: 0,
      });

      alert("✅ تمت إضافة الطالب بنجاح");

      setStudentName("");
      setSelectedClass("");

      await loadInitialData();
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء إضافة الطالب");
    } finally {
      setLoading(false);
    }
  }

  const remaining = maxStudents - currentStudents;
  const nearingLimit = remaining <= 5;

  return (
    <div className="p-6 max-w-4xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">
        إدارة الفصول والطلاب
      </h1>

      {/* لوحة معلومات الباقة */}
      <div className="border p-4 rounded mb-6 bg-gray-50">
        <h2 className="font-bold mb-2">معلومات الاشتراك</h2>

        <div>الباقة: <strong>{planName}</strong></div>
        <div>عدد الطلاب: {currentStudents} / {maxStudents}</div>

        {nearingLimit && (
          <div className="text-red-600 font-bold mt-2">
            ⚠ أنت قريب من الحد الأقصى للطلاب
          </div>
        )}
      </div>

      {/* إضافة طالب */}
      <form
        onSubmit={handleAddStudent}
        className="border p-4 rounded mb-6"
      >
        <input
          type="text"
          placeholder="اسم الطالب"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          className="border p-2 w-full mb-3 rounded"
        />

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="border p-2 w-full mb-4 rounded"
        >
          <option value="">اختر الفصل</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "جاري الإضافة..." : "إضافة الطالب"}
        </button>
      </form>
    </div>
  );
}
