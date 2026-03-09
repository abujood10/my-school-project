"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

type Group = {
  id: string;
  name: string;
  totalPoints?: number;
};

type Behavior = {
  id: string;
  name: string;
  points: number;
};

export default function GroupBehaviorPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedBehavior, setSelectedBehavior] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/group-behavior/init");
        const data = await res.json();
        if (!res.ok) return;

        setGroups(Array.isArray(data.groups) ? data.groups : []);
        setBehaviors(Array.isArray(data.behaviors) ? data.behaviors : []);
      } catch (e) {
        console.error(e);
      }
    }

    loadData();
  }, []);

  async function addGroupBehavior() {
    if (!selectedGroup || !selectedBehavior) return;

    setLoading(true);
    setMsg("");

    try {
      const res = await fetch("/api/group-behavior/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          groupId: selectedGroup,
          behaviorId: selectedBehavior,
          note,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.message || "❌ حدث خطأ");
        return;
      }

      setMsg(
        `✅ تم إضافة السلوك لـ ${data.count || 0} طالب
🏆 تمت إضافة ${data.addedPoints || 0} نقطة للمجموعة`
      );

      // تحديث نقاط المجموعة محليًا
      setGroups((prev) =>
        prev.map((g) =>
          g.id === selectedGroup
            ? {
                ...g,
                totalPoints:
                  (g.totalPoints || 0) +
                  (data.addedPoints || 0),
              }
            : g
        )
      );

      setNote("");
    } catch (e) {
      console.error(e);
      setMsg("❌ حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h2>🎯 إضافة سلوك لمجموعة</h2>

        <div style={{ marginTop: 20 }}>
          <label>👥 اختر المجموعة:</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="">-- اختر --</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} (🏆 {g.totalPoints || 0})
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          <label>⭐ اختر السلوك:</label>
          <select
            value={selectedBehavior}
            onChange={(e) =>
              setSelectedBehavior(e.target.value)
            }
          >
            <option value="">-- اختر --</option>
            {behaviors.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.points} نقطة)
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginTop: 16 }}>
          <textarea
            placeholder="ملاحظة (اختياري)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        <button
          onClick={addGroupBehavior}
          disabled={loading}
          style={{
            marginTop: 16,
            padding: "8px 16px",
            borderRadius: 8,
          }}
        >
          {loading ? "⏳ جاري التنفيذ..." : "🚀 تنفيذ"}
        </button>

        {msg && (
          <div
            style={{
              marginTop: 16,
              whiteSpace: "pre-line",
            }}
          >
            {msg}
          </div>
        )}
      </div>
    </>
  );
}