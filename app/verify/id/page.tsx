"use client";

import { useEffect, useState, useRef } from "react";
import Header from "@/app/components/Header";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [currentPosition, setCurrentPosition] = useState<number | null>(null);

  const certificateRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadSchool() {
      const res = await fetch("/api/school/info");
      const data = await res.json();
      if (!res.ok) return;

      setSchoolName(data.name);
      setSchoolLogo(data.logo || null);
    }

    loadSchool();
  }, []);

  async function loadLeaderboard() {
    if (!selectedClass) return;

    setLoading(true);

    const res = await fetch("/api/leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ className: selectedClass }),
    });

    const data = await res.json();
    if (res.ok) {
      setStudents(data.students || []);
    }

    setLoading(false);
  }

  function medal(position: number) {
    if (position === 1) return "🥇 ذهبية";
    if (position === 2) return "🥈 فضية";
    if (position === 3) return "🥉 برونزية";
    return "";
  }

  async function generateCertificate(student: Student, position: number) {
    const res = await fetch("/api/certificates/generate-leaderboard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        studentId: student.id,
        className: selectedClass,
        position,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "حدث خطأ");
      return;
    }

    setCurrentStudent(student);
    setCurrentPosition(position);

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

        {loading && <p>جاري التحميل...</p>}

        {students.slice(0, 3).map((s, index) => (
          <div key={s.id} style={{ marginBottom: 12 }}>
            {index + 1} - {s.name} ({s.totalPoints || 0} نقطة)
            <button
              style={{ marginRight: 10 }}
              onClick={() => generateCertificate(s, index + 1)}
            >
              إصدار شهادة
            </button>
          </div>
        ))}

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

          {currentStudent && currentPosition && (
            <>
              <h3 style={{ marginTop: 30 }}>
                الطالب: {currentStudent.name}
              </h3>
              <p>الفصل: {selectedClass}</p>
              <p>
                المركز: {currentPosition} {medal(currentPosition)}
              </p>
              <p>
                مجموع النقاط: {currentStudent.totalPoints || 0}
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}