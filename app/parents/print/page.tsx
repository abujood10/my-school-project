"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

type Student = {
  id: string;
  name: string;
};

type Lesson = {
  id: string;
  title: string;
  homework?: string;
  note?: string;
  day: string;
  periods: number[];
};

const DAYS_LABEL: Record<string, string> = {
  sun: "الأحد",
  mon: "الإثنين",
  tue: "الثلاثاء",
  wed: "الأربعاء",
  thu: "الخميس",
};

export default function PrintWeeklyPlan() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStudents() {
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${pb.authStore.model?.id}"`);

      const links = await pb.collection("parents_students").getFullList({
        filter: `parent="${profile.id}"`,
        expand: "student",
      });

      const list = links.map((l: any) => ({
        id: l.expand.student.id,
        name: l.expand.student.name,
      }));

      setStudents(list);
      if (list.length > 0) setSelectedStudent(list[0].id);
    }

    loadStudents();
  }, []);

  useEffect(() => {
    async function loadLessons() {
      if (!selectedStudent) return;
      setLoading(true);

      const res = await pb.collection("lessons").getFullList<Lesson>({
        filter: `studentId="${selectedStudent}"`,
        sort: "day",
      });

      setLessons(res);
      setLoading(false);
    }

    loadLessons();
  }, [selectedStudent]);

  return (
    <div dir="rtl" style={{ padding: 24, fontFamily: "system-ui, Arial" }}>
      {/* شريط الأدوات */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0 }}>🖨️ طباعة الخطة الأسبوعية</h2>

        <button
          onClick={() => window.print()}
          style={{
            padding: "8px 14px",
            background: "#111",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          🖨️ طباعة / حفظ PDF
        </button>
      </div>

      {/* اختيار الطالب */}
      <div style={{ marginBottom: 16 }}>
        <label>👦 الطالب:</label>
        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          style={{ marginRight: 8 }}
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>جاري التحميل...</p>}

      {!loading && lessons.length === 0 && (
        <p>لا توجد بيانات لعرضها</p>
      )}

      {!loading && lessons.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 12,
          }}
          border={1}
          cellPadding={8}
        >
          <thead>
            <tr>
              <th>اليوم</th>
              <th>الحصص</th>
              <th>الدرس</th>
              <th>الواجب</th>
              <th>ملاحظة</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((l) => (
              <tr key={l.id}>
                <td>{DAYS_LABEL[l.day]}</td>
                <td>{l.periods.join(", ")}</td>
                <td>{l.title}</td>
                <td>{l.homework || "—"}</td>
                <td>{l.note || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* نمط الطباعة */}
      <style jsx>{`
        @media print {
          button {
            display: none;
          }
          select {
            border: none;
          }
        }
      `}</style>
    </div>
  );
}
