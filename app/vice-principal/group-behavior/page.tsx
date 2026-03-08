"use client";

import { useEffect, useState } from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();
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

type GroupStudent = {
  id: string;
  student: string; // 👈 هنا id مباشر وليس expand
  group: string;
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
      const groupsRes = await pb.collection("groups").getFullList<Group>();
      const behaviorsRes =
        await pb.collection("behaviors").getFullList<Behavior>();

      setGroups(groupsRes);
      setBehaviors(behaviorsRes);
    }

    loadData();
  }, []);

  async function addGroupBehavior() {
    if (!selectedGroup || !selectedBehavior) return;

    setLoading(true);
    setMsg("");

    try {
      const behavior = behaviors.find(
        (b) => b.id === selectedBehavior
      );

      if (!behavior) throw new Error("سلوك غير موجود");

      // 👇 بدون expand
      const groupStudents =
        await pb.collection("group_students").getFullList<GroupStudent>({
          filter: `group="${selectedGroup}"`,
        });

      for (const gs of groupStudents) {
        await pb.collection("student_behaviors").create({
          student: gs.student, // ✅ هنا الحل
          behavior: selectedBehavior,
          points: behavior.points,
          note,
          date: new Date().toISOString(),
        });
      }

      // تحديث نقاط المجموعة
      const group = groups.find((g) => g.id === selectedGroup);
      const currentPoints = group?.totalPoints || 0;
      const addedPoints = behavior.points * groupStudents.length;

      await pb.collection("groups").update(selectedGroup, {
        totalPoints: currentPoints + addedPoints,
      });

      setMsg(
        `✅ تم إضافة السلوك لـ ${groupStudents.length} طالب
🏆 تمت إضافة ${addedPoints} نقطة للمجموعة`
      );
    } catch (e: any) {
      setMsg(e.message || "❌ حدث خطأ");
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
          <div style={{ marginTop: 16, whiteSpace: "pre-line" }}>
            {msg}
          </div>
        )}
      </div>
    </>
  );
}
