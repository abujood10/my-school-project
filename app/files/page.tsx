"use client";

import { useEffect, useState } from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();



const DAYS_LABEL: Record<string, string> = {
  sun: "الأحد",
  mon: "الإثنين",
  tue: "الثلاثاء",
  wed: "الأربعاء",
  thu: "الخميس",
};

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFiles() {
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${pb.authStore.model?.id}"`);

      const res = await pb.collection("files").getFullList({
        filter: `schoolId="${profile.schoolId}"`,
        expand: "lessonId",
        sort: "-created",
      });

      setFiles(res);
      setLoading(false);
    }

    loadFiles();
  }, []);

  if (loading) return <p>جاري التحميل...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto" }}>
      <h2>ملفات الدروس</h2>

      {files.length === 0 && <p>لا توجد ملفات</p>}

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
          {files.map((f) => {
            const lesson = f.expand?.lessonId;
            return (
              <tr key={f.id}>
                <td>{lesson?.title || "—"}</td>
                <td>
                  {lesson ? DAYS_LABEL[lesson.day] : "—"}
                </td>
                <td>
                  {lesson ? lesson.periods.join(", ") : "—"}
                </td>
                <td>
                  <a
                    href={pb.files.getUrl(f, f.file)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    تحميل
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
