"use client";

import Link from "next/link";
import Header from "@/app/components/Header";

export default function SuperAdminDashboard() {
  return (
    <>
      <Header />

      <div className="p-8 space-y-8">
        <h1 className="text-3xl font-bold">
          👑 لوحة تحكم المشرف العام
        </h1>

        <div className="grid md:grid-cols-3 gap-6">

          <Link
            href="/super-admin/schools"
            className="bg-blue-600 text-white p-6 rounded-xl text-center hover:bg-blue-700 transition"
          >
            🏫 إدارة المدارس
          </Link>

          <Link
            href="/super-admin/financial-dashboard"
            className="bg-green-600 text-white p-6 rounded-xl text-center hover:bg-green-700 transition"
          >
            💰 التقارير المالية
          </Link>

          <Link
            href="/super-admin/invoices"
            className="bg-purple-600 text-white p-6 rounded-xl text-center hover:bg-purple-700 transition"
          >
            🧾 الفواتير
          </Link>

        </div>
      </div>
    </>
  );
}