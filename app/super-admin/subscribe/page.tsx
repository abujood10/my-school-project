"use client";

import { useEffect, useState } from "react";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();
import { calculateFinalPrice } from "@/lib/pricing";

export default function SubscribeSchoolPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [billingType, setBillingType] = useState("monthly");
  const [couponCode, setCouponCode] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const s = await pb.collection("schools").getFullList();
    const p = await pb.collection("plans").getFullList();
    const c = await pb.collection("coupons").getFullList({
      filter: "active=true",
    });

    setSchools(s);
    setPlans(p);
    setCoupons(c);
  }

  async function handleSubscribe() {
    const school = schools.find(s => s.id === selectedSchool);
    const plan = plans.find(p => p.id === selectedPlan);
    const coupon = coupons.find(c => c.code === couponCode);

    if (!school || !plan) return;

    const basePrice =
      billingType === "monthly"
        ? plan.priceMonthly
        : plan.priceYearly;

    const finalPrice = calculateFinalPrice({
      basePrice,
      hasCustomPrice: school.hasCustomPrice,
      customPrice: school.customPrice,
      coupon: coupon
        ? {
            discountType: coupon.discountType,
            value: coupon.value,
          }
        : null,
    });

    const expiresAt = new Date();
    if (billingType === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    await pb.collection("schools").update(selectedSchool, {
      planId: selectedPlan,
      billingType,
      finalPrice,
      expiresAt,
      status: "active",
      couponUsed: coupon?.id || null,
    });

    alert("تم تفعيل الاشتراك بنجاح");
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        تفعيل اشتراك مدرسة
      </h1>

      <div className="space-y-4">
        <select
          value={selectedSchool}
          onChange={e => setSelectedSchool(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">اختر المدرسة</option>
          {schools.map(s => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          value={selectedPlan}
          onChange={e => setSelectedPlan(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="">اختر الباقة</option>
          {plans.map(p => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={billingType}
          onChange={e => setBillingType(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="monthly">شهري</option>
          <option value="yearly">سنوي</option>
        </select>

        <input
          type="text"
          placeholder="كود الخصم (اختياري)"
          value={couponCode}
          onChange={e => setCouponCode(e.target.value)}
          className="border p-2 w-full"
        />

        <button
          onClick={handleSubscribe}
          className="bg-green-600 text-white px-4 py-2 rounded w-full"
        >
          تفعيل الاشتراك
        </button>
      </div>
    </div>
  );
}
