"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

type Certificate = {
  id: string;
  verificationCode: string;
  studentName: string;
  grade: string;
  className: string;
  totalPoints: number;
  medal: string;
  createdAt: string;
  status: string;
  expand?: {
    school?: {
      name: string;
      logo?: string;
    };
  };
};

export default function VerifyPage() {
  const { code } = useParams();
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [invalid, setInvalid] = useState(false);

  useEffect(() => {
    async function loadCertificate() {
      try {
        const res = await pb.collection("certificates").getFirstListItem(
          `verificationCode="${code}"`,
          {
            expand: "school",
          }
        );

        if (res.status !== "active") {
          setInvalid(true);
        } else {
          setCertificate(res as any);
        }
      } catch {
        setInvalid(true);
      } finally {
        setLoading(false);
      }
    }

    if (code) loadCertificate();
  }, [code]);

  if (loading) {
    return (
      <div dir="rtl" style={wrapper}>
        <h2>⏳ جاري التحقق من الشهادة...</h2>
      </div>
    );
  }

  if (invalid || !certificate) {
    return (
      <div dir="rtl" style={wrapper}>
        <div style={card}>
          <h1 style={{ color: "#b00020" }}>❌ شهادة غير صالحة</h1>
          <p>لم يتم العثور على شهادة بهذا الرمز أو تم إلغاؤها.</p>
        </div>
      </div>
    );
  }

  const schoolLogo =
    certificate.expand?.school?.logo &&
    pb.files.getUrl(
      certificate.expand.school,
      certificate.expand.school.logo
    );

  return (
    <div dir="rtl" style={wrapper}>
      <div style={card}>
        {schoolLogo && (
          <img
            src={schoolLogo}
            alt="شعار المدرسة"
            style={{ height: 80, marginBottom: 16 }}
          />
        )}

        <h1 style={{ color: "#2e7d32" }}>✅ شهادة موثقة وصحيحة</h1>

        <h2 style={{ marginTop: 16 }}>
          {certificate.expand?.school?.name}
        </h2>

        <hr style={{ margin: "20px 0" }} />

        <p><strong>اسم الطالب:</strong> {certificate.studentName}</p>
        <p><strong>الصف:</strong> {certificate.className}</p>
        <p><strong>الدرجة:</strong> {certificate.grade}</p>
        <p><strong>إجمالي النقاط:</strong> {certificate.totalPoints}</p>
        <p><strong>الميدالية:</strong> {certificate.medal}</p>

        <p style={{ marginTop: 20, fontSize: 13, color: "#777" }}>
          تاريخ الإصدار:{" "}
          {new Date(certificate.createdAt).toLocaleDateString("ar-SA")}
        </p>
      </div>
    </div>
  );
}

/* 🎨 تنسيق بسيط احترافي */
const wrapper: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f5f6f8",
};

const card: React.CSSProperties = {
  background: "#fff",
  padding: 40,
  borderRadius: 16,
  textAlign: "center",
  boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
  maxWidth: 600,
  width: "100%",
};
