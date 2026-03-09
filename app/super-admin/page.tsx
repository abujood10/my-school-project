"use client";

import { useEffect, useState } from "react";

type Stats = {
  totalSchools: number;
  activeSchools: number;
  suspendedSchools: number;
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalSchools: 0,
    activeSchools: 0,
    suspendedSchools: 0,
  });

  useEffect(() => {
    async function loadStats() {
      const res = await fetch("/api/super-admin/schools");
      const data = await res.json();

      if (res.ok) {
        const total = data.length;
        const active = data.filter((s: any) => s.status === "active").length;
        const suspended = data.filter((s: any) => s.status === "suspended").length;

        setStats({
          totalSchools: total,
          activeSchools: active,
          suspendedSchools: suspended,
        });
      }
    }

    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        📊 لوحة تحكم المشرف العام
      </h1>

      <div className="grid md:grid-cols-3 gap-6">

        <StatCard title="إجمالي المدارس" value={stats.totalSchools} />
        <StatCard title="مدارس مفعلة" value={stats.activeSchools} />
        <StatCard title="مدارس معلقة" value={stats.suspendedSchools} />

      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow text-center">
      <h3 className="text-lg mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}