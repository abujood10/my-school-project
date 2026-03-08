"use client";

import { useEffect, useState } from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();

type Teacher = {
  id: string;
  email: string;
};

type Stats = {
  totalPoints: number;
  totalAbsence: number;
  totalLate: number;
};

export default function SchoolAdminDashboard() {
  const [schoolId, setSchoolId] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalPoints: 0,
    totalAbsence: 0,
    totalLate: 0,
  });
  const [topStudents, setTopStudents] = useState<
    { name: string; total: number }[]
  >([]);
  const [recentBehaviors, setRecentBehaviors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(
          `user="${pb.authStore.model?.id}"`,
          { expand: "schoolId" }
        );

      const sid = profile.expand?.schoolId?.id;

      if (!sid) {
        setLoading(false);
        return;
      }

      setSchoolId(sid);

      await loadTeachers(sid);
      await loadStatistics(sid);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // 🔹 تحميل المعلمين
  async function loadTeachers(sid: string) {
    const profiles = await pb.collection("profiles").getFullList<any>({
      filter: `role="teacher" && schoolId="${sid}"`,
      expand: "user",
    });

    const list = profiles.map((p) => ({
      id: p.id,
      email: p.expand?.user?.email || "",
    }));

    setTeachers(list);
  }

  // 🔹 تحميل الإحصائيات
  async function loadStatistics(sid: string) {
    // ===== السلوك =====
    const behaviors = await pb
      .collection("behavior_records")
      .getFullList<any>({
        filter: `school="${sid}" && status="approved"`,
      });

    const totalPoints = behaviors.reduce(
      (sum, b) => sum + (b.degree ?? b.points ?? 0),
      0
    );

    // ===== الغياب والتأخير =====
    const attendance = await pb
      .collection("attendance_records")
      .getFullList<any>({
        filter: `school="${sid}"`,
      });

    const totalAbsence = attendance.filter(
      (a) => a.type === "absence"
    ).length;

    const totalLate = attendance.filter(
      (a) => a.type === "late"
    ).length;

    // ===== أفضل الطلاب =====
    const studentMap: Record<string, number> = {};

    behaviors.forEach((b) => {
      const studentId = b.student;
      if (!studentId) return;

      if (!studentMap[studentId]) {
        studentMap[studentId] = 0;
      }

      studentMap[studentId] +=
        b.degree ?? b.points ?? 0;
    });

    const leaderboard = Object.entries(studentMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const top = await Promise.all(
      leaderboard.map(async ([studentId, total]) => {
        try {
          const student = await pb
            .collection("students")
            .getOne(studentId);

          return {
            name: student.name,
            total,
          };
        } catch {
          return null;
        }
      })
    );

    setTopStudents(top.filter(Boolean) as any);

    // ===== آخر 10 سجلات =====
    const recent = [...behaviors]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      )
      .slice(0, 10);

    setRecentBehaviors(recent);

    setStats({
      totalPoints,
      totalAbsence,
      totalLate,
    });
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        جاري التحميل...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-8">
        📊 لوحة تحكم المدرسة
      </h1>

      {/* ===== الإحصائيات ===== */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <StatCard
          title="إجمالي نقاط السلوك"
          value={stats.totalPoints}
          color="bg-green-100"
        />

        <StatCard
          title="إجمالي أيام الغياب"
          value={stats.totalAbsence}
          color="bg-red-100"
        />

        <StatCard
          title="إجمالي مرات التأخير"
          value={stats.totalLate}
          color="bg-yellow-100"
        />
      </div>

      {/* ===== أفضل الطلاب ===== */}
      <h2 className="text-xl font-bold mb-4">
        🏆 أفضل 5 طلاب
      </h2>

      <div className="bg-white shadow rounded p-4 mb-10">
        {topStudents.length === 0 && (
          <div className="text-gray-500">
            لا توجد بيانات بعد
          </div>
        )}

        {topStudents.map((s, i) => (
          <div
            key={i}
            className="flex justify-between border-b py-2"
          >
            <div>
              {i === 0 && "🥇 "}
              {i === 1 && "🥈 "}
              {i === 2 && "🥉 "}
              {s.name}
            </div>
            <div>{s.total} نقطة</div>
          </div>
        ))}
      </div>

      {/* ===== آخر الأنشطة ===== */}
      <h2 className="text-xl font-bold mb-4">
        🕒 آخر 10 أنشطة سلوك
      </h2>

      <div className="bg-white shadow rounded p-4">
        {recentBehaviors.length === 0 && (
          <div className="text-gray-500">
            لا توجد سجلات
          </div>
        )}

        {recentBehaviors.map((r) => (
          <div
            key={r.id}
            className="border-b py-2 text-sm"
          >
            ⭐ {r.degree ?? r.points ?? 0} نقطة —{" "}
            {new Date(r.createdAt).toLocaleDateString(
              "ar-SA"
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`${color} p-6 rounded text-center`}>
      <div className="text-3xl font-bold">
        {value}
      </div>
      <div className="mt-2">{title}</div>
    </div>
  );
}