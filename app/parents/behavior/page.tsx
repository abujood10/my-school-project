"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import Header from "@/app/components/Header";

const pb = new PocketBase("http://127.0.0.1:8090");

type Student = {
  id: string;
  name: string;
};

type StudentBehavior = {
  id: string;
  points: number;
  note?: string;
  date: string;
  expand?: {
    behavior: {
      name: string;
      category: string;
    };
  };
};

export default function ParentBehaviorPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [behaviors, setBehaviors] = useState<StudentBehavior[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(false);

  // تحميل الطلاب
  useEffect(() => {
    async function loadStudents() {
      try {
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
        if (list.length > 0) {
          setSelectedStudent(list[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    }

    loadStudents();
  }, []);

  // تحميل سجل السلوك
  useEffect(() => {
    async function loadBehaviors() {
      if (!selectedStudent) return;

      setLoading(true);

      try {
        const res = await pb
          .collection("student_behaviors")
          .getFullList<StudentBehavior>({
            filter: `student="${selectedStudent}"`,
            expand: "behavior",
            sort: "-date",
          });

        setBehaviors(res);

        const total = res.reduce(
          (sum, item) => sum + (item.points || 0),
          0
        );
        setTotalPoints(total);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    loadBehaviors();
  }, [selectedStudent]);

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h2 style={{ marginBottom: 20 }}>⭐ سجل السلوك</h2>

        {/* اختيار الطالب */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontWeight: 700 }}>👦 اختر الطالب:</label>
          <select
            value={selectedStudent}
            onChange={(e) => setSelectedStudent(e.target.value)}
            style={{
              marginRight: 8,
              padding: "6px 10px",
              borderRadius: 8,
            }}
          >
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* مجموع النقاط */}
        <div
          style={{
            background: "#1976d2",
            color: "#fff",
            padding: 16,
            borderRadius: 12,
            marginBottom: 20,
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          🧮 مجموع النقاط: {totalPoints}
        </div>

        {loading && <p>⏳ جاري التحميل...</p>}

        {!loading && behaviors.length === 0 && (
          <p>لا يوجد سجل سلوك لهذا الطالب</p>
        )}

        {!loading && behaviors.length > 0 && (
          <div
            style={{
              display: "grid",
              gap: 14,
            }}
          >
            {behaviors.map((b) => {
              const isNegative =
                b.expand?.behavior.category === "مخالف";

              return (
                <div
                  key={b.id}
                  style={{
                    background: isNegative
                      ? "#ffebee"
                      : "#e8f5e9",
                    borderRadius: 12,
                    padding: 14,
                    border: isNegative
                      ? "1px solid #ef9a9a"
                      : "1px solid #a5d6a7",
                  }}
                >
                  <strong>
                    {b.expand?.behavior.name}
                  </strong>

                  <div style={{ marginTop: 4 }}>
                    النقاط: {b.points}
                  </div>

                  {b.note && (
                    <div style={{ marginTop: 4 }}>
                      📝 {b.note}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      color: "#555",
                    }}
                  >
                    📅 {new Date(b.date).toLocaleDateString("ar-SA")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
