"use client";

import { useEffect, useState } from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();



type BehaviorRecord = {
  id: string;
  degree: number;
  status: string;
  date: string;
  expand: {
    behavior: {
      name: string;
    };
  };
};

export default function BehaviorReportPage() {
  const [records, setRecords] = useState<BehaviorRecord[]>([]);
  const [positive, setPositive] = useState(0);
  const [negative, setNegative] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const profile = await pb
          .collection("profiles")
          .getFirstListItem(`user="${pb.authStore.model?.id}"`);

        const links = await pb.collection("parents_students").getFullList({
          filter: `parent="${profile.id}"`,
        });

        if (links.length === 0) return;

        const studentIds = links.map((l: any) => `"${l.student}"`).join(",");

        const res = await pb
          .collection("behavior_records")
          .getFullList<BehaviorRecord>({
            filter: `student IN (${studentIds}) && status="approved"`,
            expand: "behavior",
          });

        // ترتيب حسب الدرجة
        const sorted = res.sort((a, b) => b.degree - a.degree);

        setRecords(sorted);

        const pos = sorted
          .filter((r) => r.degree > 0)
          .reduce((s, r) => s + r.degree, 0);

        const neg = sorted
          .filter((r) => r.degree < 0)
          .reduce((s, r) => s + r.degree, 0);

        setPositive(pos);
        setNegative(neg);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const total = positive + negative;

  return (
    <div dir="rtl" style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20 }}>📊 تقرير السلوك التفصيلي</h2>

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
              {r.degree >= 0 ? "💚" : "❤️"}{" "}
              {r.expand?.behavior?.name}
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
