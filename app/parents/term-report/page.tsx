"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

type Student = {
  id: string;
  name: string;
};

export default function TermReportPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [totalPoints, setTotalPoints] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [totalLate, setTotalLate] = useState(0);
  const [schoolName, setSchoolName] = useState("");
  const [schoolLogo, setSchoolLogo] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const term = "الفصل الأول 1446";

  useEffect(() => {
    async function loadInitial() {
      const res = await fetch("/api/parent/term-initial");
      const data = await res.json();
      if (!res.ok) return;

      setSchoolName(data.schoolName);
      setSchoolLogo(data.schoolLogo || null);
      setStudents(data.students || []);
      if (data.students?.length > 0) {
        setSelectedStudent(data.students[0].id);
      }
    }

    loadInitial();
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!selectedStudent) return;

      setLoading(true);

      const res = await fetch("/api/parent/term-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: selectedStudent }),
      });

      const data = await res.json();
      if (res.ok) {
        setTotalPoints(data.totalPoints);
        setTotalAbsent(data.totalAbsent);
        setTotalLate(data.totalLate);
      }

      setLoading(false);
    }

    loadData();
  }, [selectedStudent]);

  function getMedal() {
    if (totalPoints >= 150) return "ذهبي";
    if (totalPoints >= 100) return "فضي";
    if (totalPoints >= 50) return "برونزي";
    return "—";
  }

  function getStatus() {
    if (totalPoints >= 150) return "ممتاز جداً";
    if (totalPoints >= 100) return "ممتاز";
    if (totalPoints >= 50) return "جيد";
    return "يحتاج متابعة";
  }

  async function generateCertificate() {
    const res = await fetch("/api/parent/generate-certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: selectedStudent, term }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.message || "حدث خطأ");
      return;
    }

    setVerificationCode(data.verificationCode);
    alert("تم إصدار الشهادة بنجاح");
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h2>📜 الشهادة الرسمية</h2>

        <select
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          style={{ padding: 8, marginBottom: 20 }}
        >
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {!loading && (
          <div
            style={{
              background: "#fff",
              padding: 40,
              border: "6px double #1976d2",
              borderRadius: 20,
              maxWidth: 900,
              margin: "auto",
            }}
          >
            {schoolLogo && (
              <div style={{ textAlign: "center" }}>
                <img src={schoolLogo} style={{ height: 90 }} />
              </div>
            )}

            <h2 style={{ textAlign: "center" }}>{schoolName}</h2>
            <hr />

            <h3 style={{ textAlign: "center" }}>شهادة سلوك فصلي</h3>

            <p>
              👦 الطالب:{" "}
              {students.find((s) => s.id === selectedStudent)?.name}
            </p>
            <p>⭐ مجموع النقاط: {totalPoints}</p>
            <p>❌ الغياب: {totalAbsent}</p>
            <p>⏰ التأخير: {totalLate}</p>
            <p>🏅 الوسام: {getMedal()}</p>
            <p>📊 التقييم: {getStatus()}</p>

            {verificationCode && (
              <p style={{ marginTop: 20 }}>
                🔐 كود التحقق: <strong>{verificationCode}</strong>
              </p>
            )}

            <div style={{ marginTop: 30 }}>
              <button onClick={generateCertificate}>
                🎓 إصدار الشهادة
              </button>

              <button
                onClick={() => window.print()}
                style={{ marginRight: 10 }}
              >
                🖨️ طباعة
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}