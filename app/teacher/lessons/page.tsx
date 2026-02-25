"use client";

import { useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase("http://127.0.0.1:8090");

type Profile = {
  id: string;
  schoolId: string;
};

type Student = {
  id: string;
};

type Parent = {
  id: string;
  telegramChatId?: string;
};

type ParentStudentLink = {
  id: string;
  expand?: {
    parent?: Parent;
  };
};

type Lesson = {
  id: string;
  title: string;
  day: string;
  periods: number[];
};

export default function TeacherLessonsPage() {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("");
  const [periods, setPeriods] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  async function saveLesson(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (!pb.authStore.model?.id) {
        alert("لم يتم تسجيل الدخول");
        return;
      }

      // 👤 ملف المعلم
      const profile = await pb
        .collection("profiles")
        .getFirstListItem<Profile>(`user="${pb.authStore.model.id}"`);

      // 🧠 إنشاء الدرس
      const lesson = await pb.collection("lessons").create<Lesson>({
        title,
        day,
        periods,
        schoolId: profile.schoolId,
        teacherId: profile.id,
      });

      // 👦 الطلاب المرتبطين بالمدرسة
      const students = await pb
        .collection("students")
        .getFullList<Student>({
          filter: `schoolId="${profile.schoolId}"`,
        });

      // 🔔 إشعار أولياء الأمور
      for (const student of students) {
        const links = await pb
          .collection("parents_students")
          .getFullList<ParentStudentLink>({
            filter: `student="${student.id}"`,
            expand: "parent",
          });

        for (const link of links) {
          const parent = link.expand?.parent;

          if (parent?.telegramChatId) {
            await fetch("/api/telegram/send", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chatId: parent.telegramChatId,
                message: `📘 درس جديد\n\n${lesson.title}\n📅 ${lesson.day}\n🕒 الحصص: ${lesson.periods.join(
                  ", "
                )}`,
              }),
            });
          }
        }
      }

      alert("✅ تم حفظ الدرس وإرسال الإشعارات");
      setTitle("");
      setDay("");
      setPeriods([]);
    } catch (err) {
      console.error(err);
      alert("❌ حدث خطأ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={saveLesson}>
      <h2>إضافة درس</h2>

      <input
        placeholder="عنوان الدرس"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <input
        placeholder="اليوم"
        value={day}
        onChange={(e) => setDay(e.target.value)}
        required
      />

      <input
        placeholder="الحصص (مثال: 1,2)"
        onChange={(e) =>
          setPeriods(
            e.target.value
              .split(",")
              .map((n) => Number(n.trim()))
              .filter((n) => !isNaN(n))
          )
        }
        required
      />

      <button disabled={loading}>
        {loading ? "..." : "حفظ الدرس"}
      </button>
    </form>
  );
}