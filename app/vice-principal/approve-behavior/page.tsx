"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";
import Header from "@/app/components/Header";

const pb = new PocketBase("http://127.0.0.1:8090");

type BehaviorRecord = {
  id: string;
  degree: number;
  note?: string;
  status: string;
  expand: {
    student: { id: string; name: string };
    behavior: { id: string; name: string };
  };
};

export default function ApproveBehaviorPage() {
  const [records, setRecords] = useState<BehaviorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadPending();
  }, []);

  async function loadPending() {
    try {
      const res = await pb.collection("behavior_records").getFullList<
        BehaviorRecord
      >({
        filter: `status="pending"`,
        expand: "student,behavior",
        sort: "-createdAt",
      });

      setRecords(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string, degree: number) {
    try {
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${pb.authStore.model?.id}"`);

      await pb.collection("behavior_records").update(id, {
        status: "approved",
        degree: degree,
        approvedBy: profile.id,
        approvedAt: new Date().toISOString(),
      });

      setMsg("✅ تم الاعتماد");
      loadPending();
    } catch (e) {
      console.error(e);
      setMsg("❌ خطأ أثناء الاعتماد");
    }
  }

  async function reject(id: string) {
    try {
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${pb.authStore.model?.id}"`);

      await pb.collection("behavior_records").update(id, {
        status: "rejected",
        rejectedBy: profile.id,
        rejectedAt: new Date().toISOString(),
      });

      setMsg("❌ تم الرفض");
      loadPending();
    } catch (e) {
      console.error(e);
      setMsg("حدث خطأ");
    }
  }

  return (
    <>
      <Header />

      <div style={{ padding: 24 }} dir="rtl">
        <h2>🛡 اعتماد السلوكيات</h2>

        {loading && <p>جاري التحميل...</p>}

        {records.length === 0 && !loading && (
          <p>لا توجد سلوكيات بانتظار الاعتماد</p>
        )}

        {records.map((r) => (
          <div
            key={r.id}
            style={{
              background: "#fff",
              padding: 16,
              borderRadius: 12,
              marginBottom: 12,
              boxShadow: "0 4px 8px rgba(0,0,0,.05)",
            }}
          >
            <div style={{ fontWeight: 700 }}>
              👦 {r.expand.student.name}
            </div>

            <div>
              ⭐ {r.expand.behavior.name}
            </div>

            <div style={{ marginTop: 6 }}>
              الدرجة:
              <input
                type="number"
                defaultValue={r.degree}
                onChange={(e) =>
                  (r.degree = parseInt(e.target.value || "0"))
                }
                style={{
                  width: 80,
                  marginRight: 8,
                  padding: 4,
                }}
              />
            </div>

            {r.note && (
              <div style={{ marginTop: 6, fontSize: 13 }}>
                📝 {r.note}
              </div>
            )}

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button
                onClick={() => approve(r.id, r.degree)}
                style={{
                  background: "#2e7d32",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                اعتماد
              </button>

              <button
                onClick={() => reject(r.id)}
                style={{
                  background: "#c62828",
                  color: "#fff",
                  border: "none",
                  padding: "6px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                رفض
              </button>
            </div>
          </div>
        ))}

        {msg && <div style={{ marginTop: 16 }}>{msg}</div>}
      </div>
    </>
  );
}
