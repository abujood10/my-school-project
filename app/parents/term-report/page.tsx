"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import Header from "@/app/components/Header";

const pb = new PocketBase("http://127.0.0.1:8090");

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

      const links = await pb.collection("parents_students").getFullList({
        filter: `parent="${profile.id}"`,
        expand: "student",
      });

      const list = links.map((l: any) => ({
        id: l.expand?.student?.id,
        name: l.expand?.student?.name,
      }));

      setStudents(list);
      if (list.length > 0) setSelectedStudent(list[0].id);
    }

    loadInitial();
  }, []);

  useEffect(() => {
    async function loadData() {
      if (!selectedStudent) return;

      setLoading(true);

      const behaviors = await pb.collection("behavior_records").getFullList({
        filter: `student="${selectedStudent}" && status="approved"`,
      });

      const points = behaviors.reduce(
        (sum: number, b: any) => sum + (b.points || 0),
        0
      );

      const attendance = await pb.collection("attendance_records").getFullList({
        filter: `student="${selectedStudent}"`,
      });

      const absent = attendance.filter((a: any) => a.type === "absent").length;
      const late = attendance.filter((a: any) => a.type === "late").length;

      setTotalPoints(points);
      setTotalAbsent(absent);
      setTotalLate(late);

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
    const existing = await pb.collection("certificates").getFullList({
      filter: `student="${selectedStudent}" && term="${term}"`,
    });

    if (existing.length > 0) {
      alert("تم إصدار شهادة لهذا الفصل مسبقاً");
      setVerificationCode(existing[0].verificationCode);
      return;
    }

    const code = Math.random().toString(36).substring(2, 10).toUpperCase();

    await pb.collection("certificates").create({
      student: selectedStudent,
      school: pb.authStore.model?.schoolId,
      term,
      totalPoints,
      totalAbsent,
      totalLate,
      medal: getMedal(),
      status: getStatus(),
      verificationCode: code,
      createdAt: new Date().toISOString(),
    });

    setVerificationCode(code);
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

            <p>👦 الطالب: {students.find(s => s.id === selectedStudent)?.name}</p>
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
