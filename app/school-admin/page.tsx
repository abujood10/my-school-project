"use client";

import { useEffect, useState } from "react";

export default function SchoolAdminDashboard() {
  const [stats, setStats] = useState({
    teachers: 0,
    files: 0,
    lessons: 0,
  });

  const [recentFiles, setRecentFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await fetch("/api/school-admin/dashboard");
        const data = await res.json();
        if (!res.ok) return;

        setStats({
          teachers: data.teachers || 0,
          files: data.files || 0,
          lessons: data.lessons || 0,
        });

        setRecentFiles(data.recentFiles || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) return <p style={{ padding: 20 }}>جاري التحميل...</p>;

  return (
    <div style={{ padding: 30 }} dir="rtl">
      <h1>لوحة تحكم مدير المدرسة</h1>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <StatBox title="المعلمين" value={stats.teachers} />
        <StatBox title="الملفات" value={stats.files} />
        <StatBox title="الدروس" value={stats.lessons} />
      </div>

      <h3 style={{ marginTop: 40 }}>آخر الملفات المرفوعة</h3>

      <table
        style={{
          width: "100%",
          marginTop: 10,
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th align="right">العنوان</th>
            <th align="right">تاريخ الرفع</th>
          </tr>
        </thead>
        <tbody>
          {recentFiles.map((file) => (
            <tr key={file.id}>
              <td>{file.title}</td>
              <td>
                {new Date(file.created).toLocaleDateString("ar-SA")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatBox({ title, value }: { title: string; value: number }) {
  return (
    <div
      style={{
        flex: 1,
        padding: 20,
        border: "1px solid #ddd",
        borderRadius: 8,
        textAlign: "center",
      }}
    >
      <h3>{title}</h3>
      <p style={{ fontSize: 28, fontWeight: "bold" }}>{value}</p>
    </div>
  );
}