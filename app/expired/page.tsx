"use client";

import Link from "next/link";

export default function ExpiredPage() {
  return (
    <div
      dir="rtl"
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f6f8",
        fontFamily: "system-ui, Arial",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 64, marginBottom: 16 }}>⛔</div>

        <h1 style={{ marginBottom: 12, color: "#b00020" }}>
          تم إيقاف النظام مؤقتًا
        </h1>

        <p style={{ fontSize: 16, color: "#444", lineHeight: 1.7 }}>
          عذرًا، تم إيقاف أو انتهاء اشتراك المدرسة.
          <br />
          يرجى التواصل مع إدارة النظام لتجديد الاشتراك
          أو حل المشكلة.
        </p>

        <div style={{ marginTop: 24 }}>
          <Link href="/login">
            <button
              style={{
                padding: "10px 20px",
                borderRadius: 10,
                border: "none",
                background: "#111",
                color: "#fff",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              العودة لتسجيل الدخول
            </button>
          </Link>
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 13,
            color: "#777",
          }}
        >
          إذا كنت مدير المدرسة، تواصل مع الأدمن الرئيسي.
        </div>
      </div>
    </div>
  );
}
