"use client";

import { useEffect, useState } from "react";

const DAYS_LABEL: Record<string, string> = {
  sun: "الأحد",
  mon: "الإثنين",
  tue: "الثلاثاء",
  wed: "الأربعاء",
  thu: "الخميس",
};

type Lesson = {
  title: string;
  day: string;
  periods: string[];
};

type FileRow = {
  id: string;
  fileUrl: string;
  lesson?: Lesson;
};

export default function FilesPage() {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      try {
        const res = await fetch("/api/files");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setFiles(data.files);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, []);

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h2>ملفات الدروس</h2>

      {files.length === 0 && <p>لا توجد ملفات</p>}

      {files.length > 0 && (
        <table width="100%" border={1} cellPadding={8}>
          <thead>
            <tr>
              <th>الدرس</th>
              <th>اليوم</th>
              <th>الحصص</th>
              <th>الملف</th>
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id}>
                <td>{f.lesson?.title || "—"}</td>
                <td>
                  {f.lesson?.day
                    ? DAYS_LABEL[f.lesson.day]
                    : "—"}
                </td>
                <td>
                  {f.lesson?.periods?.length
                    ? f.lesson.periods.join(", ")
                    : "—"}
                </td>
                <td>
                  <a
                    href={f.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    تحميل
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}