"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import { useAuth } from "@/lib/AuthContext";

export default function CreateSchoolAdminPage() {
  const { role, loading } = useAuth();

  const [schools, setSchools] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [schoolId, setSchoolId] = useState("");
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSchools() {
      const res = await pb.collection("schools").getFullList();
      setSchools(res);
    }
    loadSchools();
  }, []);

  if (loading) return <p>جاري التحميل...</p>;
  if (role !== "super_admin") return <p>غير مصرح</p>;

  async function createSchoolAdmin() {
    if (!email || !password || !schoolId || !name) {
      setMsg("يرجى تعبئة جميع الحقول");
      return;
    }

    setSaving(true);
    setMsg("");

    try {
      // 1️⃣ إنشاء المستخدم
      const user = await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        emailVisibility: true,
      });

      // 2️⃣ إنشاء ملفه (profile)
      await pb.collection("profiles").create({
        user: user.id,
        role: "school_admin",
        schoolId,
        name,
      });

      setMsg("✅ تم إنشاء مدير المدرسة بنجاح");
      setEmail("");
      setPassword("");
      setName("");
      setSchoolId("");
    } catch (err: any) {
      setMsg(err?.message || "حدث خطأ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto" }}>
      <h2>إنشاء مدير مدرسة</h2>

      <input
        placeholder="اسم المدير"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="البريد الإلكتروني"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />

      <input
        type="password"
        placeholder="كلمة المرور"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={inputStyle}
      />

      <select
        value={schoolId}
        onChange={(e) => setSchoolId(e.target.value)}
        style={inputStyle}
      >
        <option value="">اختر المدرسة</option>
        {schools.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <button onClick={createSchoolAdmin} disabled={saving} style={btnStyle}>
        {saving ? "جاري الإنشاء..." : "إنشاء المدير"}
      </button>

      {msg && <p>{msg}</p>}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
};

const btnStyle: React.CSSProperties = {
  width: "100%",
  padding: 12,
  background: "#000",
  color: "#fff",
  cursor: "pointer",
};
