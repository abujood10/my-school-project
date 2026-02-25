"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

type Group = {
  id: string;
  name: string;
  totalPoints: number;
};

export default function GroupsDisplayPage() {
  const [groups, setGroups] = useState<Group[]>([]);

  async function loadGroups() {
    const res = await pb.collection("groups").getFullList<Group>({
      sort: "-totalPoints",
    });
    setGroups(res.slice(0, 5)); // أفضل 5 فقط
  }

  useEffect(() => {
    loadGroups();

    const interval = setInterval(() => {
      loadGroups();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg,#1e3c72,#2a5298)",
        color: "#fff",
        padding: 40,
        fontFamily: "system-ui",
      }}
    >
      <h1 style={{ textAlign: "center", fontSize: 40 }}>
        🏆 لوحة شرف المجموعات
      </h1>

      <div style={{ marginTop: 40 }}>
        {groups.map((g, index) => (
          <div
            key={g.id}
            style={{
              background:
                index === 0
                  ? "gold"
                  : index === 1
                  ? "silver"
                  : index === 2
                  ? "#cd7f32"
                  : "rgba(255,255,255,.1)",
              color: index <= 2 ? "#000" : "#fff",
              padding: 20,
              marginBottom: 20,
              borderRadius: 20,
              fontSize: 24,
              fontWeight: 700,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              #{index + 1} — {g.name}
            </span>
            <span>{g.totalPoints || 0} نقطة</span>
          </div>
        ))}
      </div>
    </div>
  );
}
