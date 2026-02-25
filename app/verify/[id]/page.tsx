"use client";

import { useEffect, useState, useRef } from "react";
import PocketBase from "pocketbase";
import Header from "@/app/components/Header";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const pb = new PocketBase("http://127.0.0.1:8090");

type Student = {
  id: string;
  name: string;
  class: string;
  totalPoints?: number;
};

export default function LeaderboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const certificateRef = useRef<HTMLDivElement>(null);

  // تحميل بيانات المدرسة
  useEffect(() => {
    async function loadSchool() {
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${pb.authStore.model?.id}"`, {
          expand: "schoolId",
        });

      const school = profile.expand?.schoolId;
      if (school) {
        setSchoolName(school.name);
        if (school.logo) {
          setSchoolLogo(pb.files.getUrl(school, school.logo));
        }
      }
    }

    loadSchool();
  }, []);

  async function loadLeaderboard() {
    if (!selectedClass) return;

    setLoading(true);

    const res = await pb.collection("students").getFullList<Student>({
      filter: `class="${selectedClass}"`,
    });

    const sorted = res
      .map((s) => ({
        ...s,
        totalPoints: s.totalPoints || 0,
      }))
      .sort((a, b) => b.totalPoints! - a.totalPoints!);

    setStudents(sorted);
    setLoading(false);
  }

  function medal(position: number) {
    if (position === 1) return "🥇 ذهبية";
    if (position === 2) return "🥈 فضية";
    if (position === 3) return "🥉 برونزية";
    return "";
  }

  async function generateCertificate(student: Student, position: number) {
    // منع التكرار
    const existing = await pb.collection("certificates").getFullList({
      filter: `student="${student.id}" && class="${selectedClass}"`,
    });

    if (existing.length > 0) {
      alert("تم إصدار شهادة لهذا الطالب مسبقًا");
      return;
    }

    // حفظ الشهادة
    await pb.collection("certificates").create({
      student: student.id,
      class: selectedClass,
      position,
      totalPoints: student.totalPoints,
      createdAt: new Date().toISOString(),
    });

    // تصدير PDF
    setTimeout(async () => {
      if (!certificateRef.current) return;

      const canvas = await html2canvas(certificateRef.current);
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("landscape", "pt", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, 842, 595);
      pdf.save(`certificate-${student.name}.pdf`);
    }, 500);
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h2>🏆 ترتيب الطلاب</h2>

        <div style={{ marginBottom: 16 }}>
          <input
            placeholder="أدخل الفصل"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            style={{ padding: 6, marginRight: 8 }}
          />

          <button onClick={loadLeaderboard}>
            عرض الترتيب
          </button>
        </div>

        {students.slice(0, 3).map((s, index) => (
          <div key={s.id} style={{ marginBottom: 12 }}>
            {index + 1} - {s.name} ({s.totalPoints} نقطة)
            <button
              style={{ marginRight: 10 }}
              onClick={() => generateCertificate(s, index + 1)}
            >
              إصدار شهادة
            </button>
          </div>
        ))}

        {/* تصميم الشهادة */}
        <div
          ref={certificateRef}
          style={{
            width: 800,
            height: 500,
            background: "#fff",
            padding: 40,
            marginTop: 40,
            border: "10px solid gold",
            textAlign: "center",
          }}
        >
          {schoolLogo && (
            <img src={schoolLogo} alt="logo" style={{ height: 80 }} />
          )}

          <h1>{schoolName}</h1>
          <h2>شهادة تميز سلوكي</h2>
        </div>
      </div>
    </>
  );
}
