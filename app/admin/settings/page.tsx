"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";
import { useAuth } from "@/lib/AuthContext";

export default function SchoolSettingsPage() {
  const { role, profile, loading } = useAuth();

  const [school, setSchool] = useState<any>(null);
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (profile?.schoolId) loadSchool();
  }, [profile]);

  async function loadSchool() {
    const s = await pb.collection("schools").getOne(profile.schoolId);
    setSchool(s);
    setName(s.name || "");
    setContactEmail(s.contactEmail || "");
    setContactPhone(s.contactPhone || "");
    setDescription(s.description || "");
  }

  if (loading) return <p>جاري التحميل...</p>;
  if (role !== "school_admin") return <p>غير مصرح</p>;

  async function saveSettings() {
    setSaving(true);
    setMsg("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("contactEmail", contactEmail);
      formData.append("contactPhone", contactPhone);
      formData.append("description", description);
      if (logo) formData.append("logo", logo);

      await pb.collection("schools").update(school.id, formData);

      setMsg("✅ تم حفظ الإعدادات");
      setLogo(null);
    } catch (err) {
      setMsg("حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>إعدادات المدرسة</h2>

      <input
        placeholder="اسم المدرسة"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="البريد الإلكتروني للتواصل"
        value={contactEmail}
        onChange={(e) => setContactEmail(e.target.value)}
        style={inputStyle}
      />

      <input
        placeholder="هاتف المدرسة"
        value={contactPhone}
        onChange={(e) => setContactPhone(e.target.value)}
        style={inputStyle}
      />

      <textarea
        placeholder="وصف المدرسة"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        style={{ ...inputStyle, height: 80 }}
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setLogo(e.target.files?.[0] || null)}
        style={inputStyle}
      />

      <button onClick={saveSettings} disabled={saving} style={btnStyle}>
        {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
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
