"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";

type School = {
  id: string;
  name: string;
  status: string;
  expand?: {
    plan?: {
      id: string;
      name: string;
      price: number;
    };
  };
};

export default function FinancialDashboard() {
  const [schools, setSchools] = useState<School[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [activeSchools, setActiveSchools] = useState(0);
  const [expiredSchools, setExpiredSchools] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const schoolsRes = await pb.collection("schools").getFullList<School>({
        expand: "plan",
      });

      setSchools(schoolsRes);

      let revenue = 0;
      let active = 0;
      let expired = 0;

      for (const s of schoolsRes) {
        const planPrice = s.expand?.plan?.price || 0;
        revenue += planPrice;

        if (s.status === "active") active++;
        if (s.status === "expired") expired++;
      }

      setTotalRevenue(revenue);
      setMonthlyRevenue(revenue);
      setActiveSchools(active);
      setExpiredSchools(expired);

      // حساب عدد الطلاب الكلي
      const studentsRes = await pb.collection("students").getList(1, 1);
      setTotalStudents(studentsRes.totalItems);

    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">
        💰 لوحة الإيرادات
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <Card title="عدد المدارس" value={schools.length} color="bg-blue-500" />
        <Card title="مدارس نشطة" value={activeSchools} color="bg-green-600" />
        <Card title="مدارس منتهية" value={expiredSchools} color="bg-red-600" />
        <Card title="عدد الطلاب الكلي" value={totalStudents} color="bg-purple-600" />
        <Card title="الدخل الشهري" value={`${monthlyRevenue} ريال`} color="bg-emerald-600" />
        <Card title="إجمالي الدخل" value={`${totalRevenue} ريال`} color="bg-indigo-600" />

      </div>
    </div>
  );
}

function Card({
  title,
  value,
  color,
}: {
  title: string;
  value: any;
  color: string;
}) {
  return (
    <div className={`p-6 rounded-lg text-white ${color} shadow-lg`}>
      <div className="text-lg">{title}</div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}
