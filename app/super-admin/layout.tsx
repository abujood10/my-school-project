"use client";

import Link from "next/link";
import Header from "@/app/components/Header";

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />

      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-64 bg-gray-900 text-white p-6 space-y-4">
          <h2 className="text-xl font-bold mb-6">👑 Super Admin</h2>

          <Link href="/super-admin" className="block hover:text-gray-300">
            📊 الرئيسية
          </Link>

          <Link href="/super-admin/schools" className="block hover:text-gray-300">
            🏫 المدارس
          </Link>

          <Link href="/super-admin/financial-dashboard" className="block hover:text-gray-300">
            💰 التقارير المالية
          </Link>

          <Link href="/super-admin/invoices" className="block hover:text-gray-300">
            🧾 الفواتير
          </Link>

          <Link href="/super-admin/school-admins" className="block hover:text-gray-300">
            👤 مدراء المدارس
          </Link>
        </aside>

        {/* Content */}
        <main className="flex-1 p-8 bg-gray-50">
          {children}
        </main>
      </div>
    </>
  );
}