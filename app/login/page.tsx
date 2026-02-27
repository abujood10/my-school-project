"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

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
      await pb.collection("users").authWithPassword(email, password);

      const profile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${pb.authStore.model?.id}"`);

      switch (profile.role) {
        case "super_admin":
          router.push("/super-admin");
          break;
        case "school_admin":
          router.push("/school-admin");
          break;
        case "teacher":
          router.push("/teacher");
          break;
        case "parent":
          router.push("/parents");
          break;
        default:
          throw new Error("الدور غير معروف");
      }
    } catch (err: any) {
      setError(err.message || "فشل تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 space-y-6">

        {/* العنوان */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-800">
            تسجيل الدخول
          </h1>
          <p className="text-gray-500 text-sm">
            الرجاء إدخال بيانات الدخول الخاصة بك
          </p>
        </div>

        {/* الفورم */}
        <form onSubmit={handleLogin} className="space-y-4">

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              كلمة المرور
            </label>
            <input
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "جاري تسجيل الدخول..." : "دخول"}
          </button>

        </form>

        {/* رسالة الخطأ */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg text-center">
            {error}
          </div>
        )}

      </div>
    </div>
  );
}