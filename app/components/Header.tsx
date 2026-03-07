"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserData = {
  role: string;
  name: string;
  schoolName: string;
};

export default function Header() {
  const [user, setUser] = useState<UserData | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/me");
        const data = await res.json();
        if (res.ok) {
          setUser(data);
        }
      } catch {}
    }

    loadUser();
  }, []);

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  function renderLinks() {
    if (!user) return null;

    switch (user.role) {
      case "super_admin":
        return (
          <>
            <Link href="/super-admin">لوحة التحكم</Link>
          </>
        );

      case "school_admin":
        return (
          <>
            <Link href="/school-admin">لوحة المدرسة</Link>
            <Link href="/school-admin/students">الطلاب</Link>
            <Link href="/school-admin/teachers">المعلمون</Link>
          </>
        );

      case "teacher":
        return (
          <>
            <Link href="/teacher">لوحة المعلم</Link>
            <Link href="/teacher/lessons">الخطة الأسبوعية</Link>
          </>
        );

      case "parent":
        return (
          <>
            <Link href="/parents">لوحة ولي الأمر</Link>
            <Link href="/parents/behavior">السلوك</Link>
            <Link href="/parents/attendance">الحضور</Link>
          </>
        );

      case "vice_principal":
        return (
          <>
            <Link href="/vice-principal">لوحة الوكيل</Link>
            <Link href="/vice-principal/behaviors">السلوك</Link>
          </>
        );

      default:
        return null;
    }
  }

  return (
    <header
      style={{
        background: "#111827",
        color: "#fff",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div>
        <strong>
          {user?.schoolName || "نظام المدارس"}
        </strong>
      </div>

      <nav
        style={{
          display: "flex",
          gap: 20,
          alignItems: "center",
        }}
      >
        {renderLinks()}

        {user && (
          <span style={{ fontSize: 14 }}>
            👤 {user.name}
          </span>
        )}

        <button
          onClick={logout}
          style={{
            background: "#ef4444",
            border: "none",
            padding: "6px 12px",
            borderRadius: 6,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          خروج
        </button>
      </nav>
    </header>
  );
}