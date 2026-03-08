"use client";

import { useState } from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();



type School = {
  id: string;
  customPrice?: number;
  customMaxStudents?: number;
  customMaxTeachers?: number;
  customDurationDays?: number;
  expand?: {
    plan?: {
      id: string;
      price?: number;
      durationDays?: number;
    };
  };
};

export default function SchoolsPage() {
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadData() {
    // ضع هنا كود إعادة تحميل البيانات إن وجد
  }

  async function updateSchool() {
    if (!selectedSchool) return;

    const school = selectedSchool;
    setLoading(true);

    try {
      const plan = school.expand?.plan;

      if (!plan) {
        alert("لا توجد باقة مرتبطة بالمدرسة");
        return;
      }

      const currentMonth = new Date().toISOString().slice(0, 7);

      const existing = await pb.collection("payments").getFullList({
        filter: `school="${school.id}" && month="${currentMonth}" && status="paid"`,
      });

      if (existing.length > 0) {
        alert("تم إصدار فاتورة لهذا الشهر مسبقاً");
        return;
      }

      const duration =
        school.customDurationDays ??
        plan.durationDays ??
        30;

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration);

      const finalPrice =
        school.customPrice ??
        plan.price ??
        0;

      await pb.collection("schools").update(school.id, {
        customPrice: school.customPrice ?? null,
        customMaxStudents: school.customMaxStudents ?? null,
        customMaxTeachers: school.customMaxTeachers ?? null,
        customDurationDays: school.customDurationDays ?? null,
        status: "active",
        expiresAt: expiresAt.toISOString(),
      });

      const invoiceNumber = "INV-" + Date.now();

      await pb.collection("payments").create({
        school: school.id,
        plan: plan.id,
        amount: finalPrice,
        status: "paid",
        invoiceNumber,
        paidAt: new Date().toISOString(),
        month: currentMonth,
      });

      alert("✅ تم التفعيل وإنشاء فاتورة بنجاح");

      setSelectedSchool(null);
      loadData();

    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء التحديث");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button onClick={updateSchool} disabled={loading}>
        {loading ? "جاري التحديث..." : "تحديث المدرسة"}
      </button>
    </div>
  );
}