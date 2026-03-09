"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

type Stats = {
  students: number;
  teachers: number;
  lessons: number;
};

type StatCardProps = {
  title: string;
  value: number;
};

function StatCard({ title, value }: StatCardProps) {
  return (
    <div className="bg-gray-100 p-6 rounded-xl text-center">
      <h3 className="text-lg mb-2">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

export default function SchoolAdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    students: 0,
    teachers: 0,
    lessons: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin-stats");
        const data = await res.json();

        if (res.ok) {
          setStats({
            students: data.students ?? 0,
            teachers: data.teachers ?? 0,
            lessons: data.lessons ?? 0,
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="p-6">جاري التحميل...</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="p-6 grid md:grid-cols-3 gap-6">
        <StatCard title="الطلاب" value={stats.students} />
        <StatCard title="المعلمون" value={stats.teachers} />
        <StatCard title="الدروس" value={stats.lessons} />
      </div>
    </>
  );
}