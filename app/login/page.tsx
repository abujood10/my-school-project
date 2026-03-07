"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "فشل تسجيل الدخول");
      }

      const role = String(data.role).trim();

      if (role === "super_admin") {
        router.push("/super-admin");
        return;
      }

      if (role === "school_admin") {
        router.push("/school-admin");
        return;
      }

      if (role === "teacher") {
        router.push("/teacher");
        return;
      }

      if (role === "parent") {
        router.push("/parents");
        return;
      }

      if (role === "vice_principal") {
        router.push("/vice-principal");
        return;
      }

      // إذا وصلنا هنا
      console.error("Unknown role:", role);
      throw new Error("الدور غير معروف");

    } catch (err: any) {
      setError(err.message || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">
            تسجيل الدخول
          </h1>
          <p className="text-gray-500 text-sm">
            الرجاء إدخال بيانات الدخول الخاصة بك
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="البريد الإلكتروني"
            required
            className="w-full p-3 border rounded-lg"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            required
            className="w-full p-3 border rounded-lg"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            {loading ? "جاري الدخول..." : "دخول"}
          </button>

        </form>

        {error && (
          <div className="text-red-600 text-sm text-center">
            {error}
          </div>
        )}

      </div>
    </div>
  );
}