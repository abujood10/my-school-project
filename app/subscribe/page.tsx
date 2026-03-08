"use client";

import { useEffect, useState } from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();

type Plan = {
  id: string;
  name: string;
  price: number;
  maxStudents: number;
};

export default function SubscribePage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    const res = await pb.collection("plans").getFullList<Plan>({
      sort: "price",
    });
    setPlans(res);
  }

  async function handleSubscribe(plan: Plan) {
    setLoading(true);

    try {
      const profile = await pb
        .collection("profiles")
        .getFirstListItem(`user="${pb.authStore.model?.id}"`, {
          expand: "schoolId",
        });

      const school = profile.expand?.schoolId;

      if (!school) {
        alert("لم يتم العثور على مدرسة مرتبطة");
        return;
      }

      // إنشاء عملية دفع pending
      const payment = await pb.collection("payments").create({
        school: school.id,
        plan: plan.id,
        amount: plan.price,
        status: "pending",
        createdBy: profile.id,
      });

      // 🔹 هنا سنحاكي نجاح الدفع (مؤقتًا)
      await simulatePaymentSuccess(payment.id, school.id, plan.id);

      alert("✅ تم الاشتراك بنجاح");

    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الاشتراك");
    } finally {
      setLoading(false);
    }
  }

  async function simulatePaymentSuccess(
    paymentId: string,
    schoolId: string,
    planId: string
  ) {
    // تحديث الدفع
    await pb.collection("payments").update(paymentId, {
      status: "paid",
      paidAt: new Date(),
    });

    // تفعيل المدرسة
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    await pb.collection("schools").update(schoolId, {
      status: "active",
      plan: planId,
      expiresAt: nextMonth,
    });
  }

  return (
    <div className="p-8 max-w-5xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-8 text-center">
        💳 اختر باقتك
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="border rounded-xl p-6 shadow hover:shadow-lg transition"
          >
            <h2 className="text-xl font-bold mb-4">{plan.name}</h2>

            <div className="text-3xl font-bold mb-4">
              {plan.price} ريال
            </div>

            <div className="mb-4">
              👨‍🎓 حتى {plan.maxStudents} طالب
            </div>

            <button
              onClick={() => handleSubscribe(plan)}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {loading ? "جارٍ المعالجة..." : "اشترك الآن"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
