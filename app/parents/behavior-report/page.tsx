"use client";

import { useEffect, useState } from "react";

type BehaviorRecord = {
  id: string;
  degree: number;
  behaviorName: string;
  date: string;
};

export default function BehaviorReportPage() {
  const [records, setRecords] = useState<BehaviorRecord[]>([]);
  const [positive, setPositive] = useState(0);
  const [negative, setNegative] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/parent/behavior-report");
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const sorted = data.records.sort(
          (a: BehaviorRecord, b: BehaviorRecord) =>
            b.degree - a.degree
        );

        setRecords(sorted);
        setPositive(data.positive);
        setNegative(data.negative);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const total = positive + negative;

  return (
    <div dir="rtl" style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20 }}>
        📊 تقرير السلوك التفصيلي
      </h2>

      <button
        onClick={() => window.print()}
        style={{
          padding: "8px 16px",
          borderRadius: 8,
          border: "none",
          background: "#111",
          color: "#fff",
          cursor: "pointer",
          marginBottom: 20,
        }}
      >
        🖨️ طباعة
      </button>

      {loading && <p>⏳ جاري التحميل...</p>}

      {!loading &&
        records.map((r) => (
          <div
            key={r.id}
            style={{
              padding: 12,
              borderRadius: 10,
              marginBottom: 10,
              background: r.degree >= 0 ? "#e8f5e9" : "#fdecea",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>
              {r.degree >= 0 ? "💚" : "❤️"} {r.behaviorName}
            </span>

            <strong
              style={{
                color: r.degree >= 0 ? "green" : "red",
              }}
            >
              {r.degree}
            </strong>
          </div>
        ))}

      <hr style={{ margin: "20px 0" }} />

      <div style={{ fontWeight: 600 }}>
        <div>إجمالي الإيجابي: {positive}</div>
        <div>إجمالي السلبي: {negative}</div>
        <div style={{ fontSize: 18, marginTop: 10 }}>
          المجموع النهائي: {total}
        </div>
      </div>
    </div>
  );
}