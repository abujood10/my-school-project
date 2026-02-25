"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

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
        // جلب profile
        const profile = await pb
          .collection("profiles")
          .getFirstListItem(`user="${pb.authStore.model?.id}"`);

        const schoolId = profile.schoolId;

        // إحصائيات
        const teachers = await pb.collection("profiles").getList(1, 1, {
          filter: `schoolId="${schoolId}" && role="teacher"`,
        });

        const files = await pb.collection("files").getList(1, 1, {
          filter: `schoolId="${schoolId}"`,
        });

        const lessons = await pb.collection("lessons").getList(1, 1, {
          filter: `schoolId="${schoolId}"`,
        });

        // آخر الملفات
        const latestFiles = await pb.collection("files").getList(1, 5, {
          filter: `schoolId="${schoolId}"`,
          sort: "-created",
        });

        setStats({
          teachers: teachers.totalItems,
          files: files.totalItems,
          lessons: lessons.totalItems,
        });

        setRecentFiles(latestFiles.items);
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
    <div style={{ padding: 30 }}>
      <h1>لوحة تحكم مدير المدرسة</h1>

      {/* الإحصائيات */}
      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <StatBox title="المعلمين" value={stats.teachers} />
        <StatBox title="الملفات" value={stats.files} />
        <StatBox title="الدروس" value={stats.lessons} />
      </div>

      {/* آخر الملفات */}
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
              <td>{new Date(file.created).toLocaleDateString("ar-SA")}</td>
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
