"use client";

import { useEffect, useState } from "react";
import Header from "@/app/components/Header";

type BehaviorRecord = {
  id: string;
  degree: number;
  note?: string;
  studentName: string;
  behaviorName: string;
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
      const res = await fetch("/api/behavior/pending");
      const data = await res.json();
      if (!res.ok) return;

      setRecords(data.records || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function approve(id: string, degree: number) {
    try {
      const res = await fetch("/api/behavior/approve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, degree }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || "❌ خطأ أثناء الاعتماد");
        return;
      }

      setMsg("✅ تم الاعتماد");
      loadPending();
    } catch (e) {
      console.error(e);
      setMsg("❌ خطأ أثناء الاعتماد");
    }
  }

  async function reject(id: string) {
    try {
      const res = await fetch("/api/behavior/reject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.message || "حدث خطأ");
        return;
      }

      setMsg("❌ تم الرفض");
      loadPending();
    } catch (e) {
      console.error(e);
      setMsg("حدث خطأ");
    }
  }

  function updateDegree(id: string, value: number) {
    setRecords((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, degree: value } : r
      )
    );
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
              👦 {r.studentName}
            </div>

            <div>⭐ {r.behaviorName}</div>

            <div style={{ marginTop: 6 }}>
              الدرجة:
              <input
                type="number"
                value={r.degree}
                onChange={(e) =>
                  updateDegree(r.id, Number(e.target.value))
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

            <div
              style={{
                marginTop: 10,
                display: "flex",
                gap: 8,
              }}
            >
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