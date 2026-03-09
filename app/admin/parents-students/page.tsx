"use client";

import { useEffect, useState } from "react";
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
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [links, setLinks] = useState<LinkRow[]>([]);

  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedParent, setSelectedParent] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);

  // تحميل البيانات من API
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/parents-students");
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        setStudents(data.students);
        setParents(data.parents);
        setLinks(data.links);
      } catch (e: any) {
        console.error("خطأ التحميل", e);
      } finally {
        setLoading(false);
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
      const res = await fetch("/api/admin/parents-students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          parentId: selectedParent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setLinks(data.links);
      setMsg("✅ تم الربط بنجاح");

      setSelectedStudent("");
      setSelectedParent("");

    } catch (e: any) {
      setMsg(e.message || "❌ فشل الربط");
    }
  }

  // فك الربط
  async function unlink(id: string) {
    if (!confirm("هل أنت متأكد من فك الربط؟")) return;

    try {
      const res = await fetch(`/api/admin/parents-students?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setLinks(data.links);

    } catch (e: any) {
      alert(e.message || "فشل فك الربط");
    }
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h1 style={{ marginBottom: 16 }}>
          🔗 ربط الطلاب بأولياء الأمور
        </h1>

        {loading && <p>⏳ جاري التحميل...</p>}

        {!loading && (
          <>
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
                onChange={(e) =>
                  setSelectedStudent(e.target.value)
                }
                required
              >
                <option value="">
                  — اختر الطالب —
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedParent}
                onChange={(e) =>
                  setSelectedParent(e.target.value)
                }
                required
                style={{ marginRight: 8 }}
              >
                <option value="">
                  — اختر ولي الأمر —
                </option>
                {parents.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              <button style={{ marginRight: 8 }}>
                🔗 ربط
              </button>

              {msg && (
                <p style={{ marginTop: 8 }}>
                  {msg}
                </p>
              )}
            </form>

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
                  👦 <strong>{l.studentName}</strong>
                  {" — "}
                  👨‍👩‍👧 {l.parentName}
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
          </>
        )}
      </div>
    </>
  );
}