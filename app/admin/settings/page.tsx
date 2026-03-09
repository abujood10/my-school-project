"use client";

import { useEffect, useState } from "react";

export default function SchoolSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [school, setSchool] = useState<any>(null);
  const [name, setName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    loadSchool();
  }, []);

  async function loadSchool() {
    try {
      const res = await fetch("/api/admin/school-settings");
      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setSchool(data.school);
      setName(data.school?.name ?? "");
      setContactEmail(data.school?.contactEmail ?? "");
      setContactPhone(data.school?.contactPhone ?? "");
      setDescription(data.school?.description ?? "");
      setAuthorized(true);
    } catch (e: any) {
      setMsg(e.message || "غير مصرح");
      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    if (!school) return;

    setSaving(true);
    setMsg("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("contactEmail", contactEmail);
      formData.append("contactPhone", contactPhone);
      formData.append("description", description);

      if (logo) {
        formData.append("logo", logo);
      }

      const res = await fetch("/api/admin/school-settings", {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMsg("✅ تم حفظ الإعدادات بنجاح");
      setLogo(null);
    } catch (e: any) {
      setMsg(e.message || "حدث خطأ أثناء الحفظ");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>جاري التحميل...</p>;
  if (!authorized) return <p>غير مصرح</p>;

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
        onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
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