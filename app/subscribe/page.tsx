"use client";

import { useEffect, useState } from "react";

type Plan = {
  id: string;
  name: string;
  price: number;
  maxStudents: number;
};

export default function SubscribePage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlanId, setLoadingPlanId] = useState<string | null>(null);

  useEffect(() => {
    loadPlans();
  }, []);

  async function loadPlans() {
    try {
      const res = await fetch("/api/plans");
      const data = await res.json();
      if (!res.ok) return;
      setPlans(data.plans || []);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubscribe(plan: Plan) {
    setLoadingPlanId(plan.id);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planId: plan.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "حدث خطأ أثناء الاشتراك");
        return;
      }

      alert("✅ تم الاشتراك بنجاح");
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء الاشتراك");
    } finally {
      setLoadingPlanId(null);
    }
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
              disabled={loadingPlanId === plan.id}
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingPlanId === plan.id
                ? "جارٍ المعالجة..."
                : "اشترك الآن"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}