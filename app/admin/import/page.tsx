"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import PocketBase from "pocketbase";

const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

type Row = {
  student_name: string;
  student_national_id: string;
  class: string;
  parent_name: string;
  parent_national_id: string;
  parent_phone: string;
};

export default function ImportStudentsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  function downloadTemplate() {
    const headers = [
      {
        student_name: "",
        student_national_id: "",
        class: "",
        parent_name: "",
        parent_national_id: "",
        parent_phone: "",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(headers);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    XLSX.writeFile(wb, "students_import_template.xlsx");
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const wb = XLSX.read(data, { type: "binary" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Row>(sheet);
      setRows(json);
    };
    reader.readAsBinaryString(file);
  }

  async function importData() {
    if (rows.length === 0) return;

    setLoading(true);
    setMsg("");

    let studentsAdded = 0;
    let parentsAdded = 0;
    let skipped = 0;

    try {
      for (const raw of rows) {
        const r = {
          student_name: raw.student_name?.trim(),
          student_national_id: raw.student_national_id?.trim(),
          class: raw.class?.trim(),
          parent_name: raw.parent_name?.trim(),
          parent_national_id: raw.parent_national_id?.trim(),
          parent_phone: raw.parent_phone?.trim(),
        };

        // تجاهل الصفوف الناقصة
        if (
          !r.student_name ||
          !r.student_national_id ||
          !r.parent_national_id ||
          !r.parent_phone
        ) {
          skipped++;
          continue;
        }

        // 1️⃣ الطالب
        let student;
        try {
          student = await pb
            .collection("students")
            .getFirstListItem(`nationalId="${r.student_national_id}"`);
          skipped++;
        } catch {
          student = await pb.collection("students").create({
            name: r.student_name,
            nationalId: r.student_national_id,
            class: r.class,
          });
          studentsAdded++;
        }

        // 2️⃣ ولي الأمر
        let parentProfile;
        try {
          parentProfile = await pb
            .collection("profiles")
            .getFirstListItem(`nationalId="${r.parent_national_id}"`);
          skipped++;
        } catch {
          const user = await pb.collection("users").create({
            email: `${r.parent_national_id}@parent.local`,
            password: r.parent_phone,
            passwordConfirm: r.parent_phone,
          });

          parentProfile = await pb.collection("profiles").create({
            user: user.id,
            name: r.parent_name,
            nationalId: r.parent_national_id,
            phone: r.parent_phone,
            role: "parent",
          });

          parentsAdded++;
        }

        // 3️⃣ الربط
        try {
          await pb.collection("parents_students").create({
            parent: parentProfile.id,
            student: student.id,
          });
        } catch {
          // تجاهل التكرار
        }
      }

      setMsg(
        `✅ تم الاستيراد بنجاح
👦 طلاب جدد: ${studentsAdded}
👨‍👩‍👧 أولياء أمور جدد: ${parentsAdded}
⏭️ صفوف متجاهلة: ${skipped}`
      );
    } catch (err: any) {
      setMsg(err.message || "❌ فشل الاستيراد");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin: "40px auto" }} dir="rtl">
      <h2>📥 استيراد الطلاب وأولياء الأمور</h2>

      <button onClick={downloadTemplate}>⬇️ تحميل قالب Excel</button>

      <br /><br />

      <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} />

      {rows.length > 0 && (
        <>
          <p>📊 عدد الصفوف: {rows.length}</p>

          <button
            onClick={importData}
            disabled={loading}
            style={{ marginTop: 12 }}
          >
            {loading ? "⏳ جاري الاستيراد..." : "🚀 استيراد وحفظ"}
          </button>
        </>
      )}

      {msg && (
        <pre
          style={{
            marginTop: 16,
            background: "#f5f5f5",
            padding: 12,
            whiteSpace: "pre-wrap",
          }}
        >
          {msg}
        </pre>
      )}
    </div>
  );
}
