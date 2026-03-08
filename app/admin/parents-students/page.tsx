"use client";

import { useEffect, useState } from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();
import Header from "@/app/components/Header";


type Student = {
  id: string;
  name: string;
};

type Parent = {
  id: string;
  name: string;
};

type LinkRow = {
  id: string;
  studentName: string;
  parentName: string;
};

export default function ParentsStudentsPage() {
  const [schoolId, setSchoolId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([]);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedParent, setSelectedParent] = useState("");
  const [msg, setMsg] = useState("");

  // تحميل البيانات
  useEffect(() => {
    async function loadData() {
      try {
        const profile = await pb
          .collection("profiles")
          .getFirstListItem(`user="${pb.authStore.model?.id}"`);

        setSchoolId(profile.schoolId);

        // الطلاب
        const studentsList = await pb.collection("students").getFullList({
          filter: `schoolId="${profile.schoolId}"`,
          sort: "name",
        });

        setStudents(
          studentsList.map((s: any) => ({
            id: s.id,
            name: s.name,
          }))
        );

        // أولياء الأمور
        const parentsList = await pb.collection("profiles").getFullList({
          filter: `schoolId="${profile.schoolId}" && role="parent"`,
          sort: "name",
        });

        setParents(
          parentsList.map((p: any) => ({
            id: p.id,
            name: p.name,
          }))
        );

        // الروابط
        const linksList = await pb.collection("parents_students").getFullList({
          expand: "student,parent",
        });

        setLinks(
          linksList.map((l: any) => ({
            id: l.id,
            studentName: l.expand.student.name,
            parentName: l.expand.parent.name,
          }))
        );
      } catch (e) {
        console.error("خطأ التحميل", e);
      }
    }

    loadData();
  }, []);

  // ربط
  async function linkStudentParent(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!selectedStudent || !selectedParent) {
      setMsg("⚠️ اختر الطالب وولي الأمر");
      return;
    }

    try {
      await pb.collection("parents_students").create({
        student: selectedStudent,
        parent: selectedParent,
      });

      setMsg("✅ تم الربط بنجاح");

      // تحديث القائمة
      const student = students.find((s) => s.id === selectedStudent);
      const parent = parents.find((p) => p.id === selectedParent);

      if (student && parent) {
        setLinks((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            studentName: student.name,
            parentName: parent.name,
          },
        ]);
      }
    } catch (e: any) {
      setMsg(e.message || "❌ فشل الربط (قد يكون موجودًا)");
    }
  }

  // فك الربط
  async function unlink(id: string) {
    if (!confirm("هل أنت متأكد من فك الربط؟")) return;

    try {
      await pb.collection("parents_students").delete(id);
      setLinks((prev) => prev.filter((l) => l.id !== id));
    } catch {
      alert("فشل فك الربط");
    }
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h1 style={{ marginBottom: 16 }}>🔗 ربط الطلاب بأولياء الأمور</h1>

        {/* نموذج الربط */}
        <form
          onSubmit={linkStudentParent}
          style={{
            background: "#fafafa",
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <h3>➕ ربط جديد</h3>

          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            required
          >
            <option value="">— اختر الطالب —</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
            required
            style={{ marginRight: 8 }}
          >
            <option value="">— اختر ولي الأمر —</option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button style={{ marginRight: 8 }}>🔗 ربط</button>

          {msg && <p style={{ marginTop: 8 }}>{msg}</p>}
        </form>

        {/* الروابط الحالية */}
        <h3>📋 الروابط الحالية</h3>

        {links.length === 0 && <p>لا توجد روابط</p>}

        {links.map((l) => (
          <div
            key={l.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #eee",
              padding: "8px 0",
            }}
          >
            <div>
              👦 <strong>{l.studentName}</strong> — 👨‍👩‍👧 {l.parentName}
            </div>

            <button
              onClick={() => unlink(l.id)}
              style={{
                background: "#ffecec",
                border: "1px solid #ffb3b3",
                borderRadius: 8,
                padding: "6px 10px",
                cursor: "pointer",
              }}
            >
              ❌ فك
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
