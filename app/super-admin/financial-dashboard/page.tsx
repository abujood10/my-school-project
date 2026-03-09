"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase(
  process.env.NEXT_PUBLIC_PB_URL!
);

export default function FinancialDashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [activeSchools, setActiveSchools] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const payments = await pb
        .collection("payments")
        .getFullList();

      const nowMonth = new Date()
        .toISOString()
        .slice(0, 7);

      let total = 0;
      let monthly = 0;

      payments.forEach((p: any) => {
        if (p.status === "paid") {
          total += p.amount;

          const paymentMonth =
            new Date(p.paidAt || p.created)
              .toISOString()
              .slice(0, 7);

          if (paymentMonth === nowMonth) {
            monthly += p.amount;
          }
        }
      });

      const schools = await pb
        .collection("schools")
        .getFullList();

      const active = schools.filter(
        (s: any) => s.status === "active"
      ).length;

      setTotalRevenue(total);
      setMonthlyRevenue(monthly);
      setActiveSchools(active);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-8">
        💰 لوحة الإيرادات
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <Card
          title="الدخل الشهري"
          value={`${monthlyRevenue} ريال`}
        />

        <Card
          title="إجمالي الدخل"
          value={`${totalRevenue} ريال`}
        />

        <Card
          title="مدارس نشطة"
          value={activeSchools}
        />

      </div>
    </div>
  );
}

function Card({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="p-6 rounded-lg text-white bg-indigo-600 shadow-lg">
      <div className="text-lg">{title}</div>
      <div className="text-2xl font-bold mt-2">
        {value}
      </div>
    </div>
  );
}