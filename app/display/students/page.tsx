"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

type Student = {
  id: string;
  name: string;
  photo?: string;
  totalPoints: number;
};

type Group = {
  id: string;
  name: string;
  totalPoints: number;
};

type School = {
  id: string;
  name: string;
  logo?: string;
};

export default function StudentsDisplayPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [topStudentId, setTopStudentId] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);

  async function loadData() {
    try {
      const studentsRes = await pb.collection("students").getFullList<Student>({
        sort: "-totalPoints",
      });

      const top10 = studentsRes.slice(0, 10);
      setStudents(top10);

      if (top10.length > 0 && top10[0].id !== topStudentId) {
        setTopStudentId(top10[0].id);
        triggerCelebration();
      }

      const groupsRes = await pb.collection("groups").getFullList<Group>({
        sort: "-totalPoints",
      });

      setGroups(groupsRes.slice(0, 5));

      const schoolsRes = await pb.collection("schools").getFullList<School>();
      if (schoolsRes.length > 0) {
        setSchool(schoolsRes[0]);
      }
    } catch (err) {
      console.error(err);
    }
  }

  function triggerCelebration() {
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 3000);
  }

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#141e30,#243b55)",
        color: "#fff",
        padding: 40,
        fontFamily: "system-ui",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* تأثير احتفال بدون مكتبات */}
      {celebrate && (
        <div className="celebration">
          {Array.from({ length: 60 }).map((_, i) => (
            <span key={i} className="confetti" />
          ))}
        </div>
      )}

      {school && (
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          {school.logo && (
            <img
              src={pb.files.getUrl(school, school.logo)}
              style={{ height: 100, marginBottom: 10 }}
            />
          )}
          <h1 style={{ fontSize: 40 }}>{school.name}</h1>
        </div>
      )}

      <h2 style={{ marginBottom: 20 }}>🌟 لوحة شرف الطلاب</h2>

      <div style={{ display: "grid", gap: 20 }}>
        {students.map((s, index) => (
          <div
            key={s.id}
            style={{
              background:
                index === 0
                  ? "gold"
                  : index === 1
                  ? "silver"
                  : index === 2
                  ? "#cd7f32"
                  : "rgba(255,255,255,.08)",
              color: index <= 2 ? "#000" : "#fff",
              padding: 20,
              borderRadius: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              transform: index === 0 ? "scale(1.05)" : "scale(1)",
              transition: "0.3s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              {s.photo && (
                <img
                  src={pb.files.getUrl(s, s.photo)}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              )}
              <span style={{ fontSize: 24, fontWeight: 700 }}>
                #{index + 1} — {s.name}
              </span>
            </div>

            <span style={{ fontSize: 22 }}>
              {s.totalPoints || 0} نقطة
            </span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 60 }}>
        <h2 style={{ marginBottom: 20 }}>🏆 أفضل المجموعات</h2>

        {groups.map((g, i) => (
          <div
            key={g.id}
            style={{
              background: "rgba(255,255,255,.1)",
              padding: 15,
              borderRadius: 12,
              marginBottom: 10,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>#{i + 1} — {g.name}</span>
            <span>{g.totalPoints || 0} نقطة</span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .celebration {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .confetti {
          position: absolute;
          width: 10px;
          height: 10px;
          background: hsl(${Math.random() * 360}, 100%, 50%);
          top: -10px;
          left: ${Math.random() * 100}%;
          animation: fall 3s linear forwards;
        }

        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
