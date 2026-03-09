"use client";

import { useEffect, useState } from "react";
import PocketBase from "pocketbase";

const pb = new PocketBase(
  process.env.NEXT_PUBLIC_PB_URL!
);

type Invoice = {
  id: string;
  invoiceNumber: string;
  amount: number;
  paidAt?: string;
  created?: string;
  expand?: {
    school?: { name: string };
    plan?: { name: string };
  };
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      const res = await pb.collection("payments").getFullList<Invoice>({
        expand: "school,plan",
        sort: "-paidAt",
      });

      setInvoices(res.filter((i: any) => i.status === "paid"));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-6">جاري التحميل...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">
        🧾 الفواتير
      </h1>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">رقم الفاتورة</th>
            <th className="border p-2">المدرسة</th>
            <th className="border p-2">الباقة</th>
            <th className="border p-2">المبلغ</th>
            <th className="border p-2">التاريخ</th>
            <th className="border p-2">تحميل</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((i) => {
            const date =
              i.paidAt || i.created;

            return (
              <tr key={i.id}>
                <td className="border p-2">
                  {i.invoiceNumber || i.id}
                </td>

                <td className="border p-2">
                  {i.expand?.school?.name || "-"}
                </td>

                <td className="border p-2">
                  {i.expand?.plan?.name || "-"}
                </td>

                <td className="border p-2">
                  {i.amount} ريال
                </td>

                <td className="border p-2">
                  {date
                    ? new Date(date).toLocaleDateString("ar-SA")
                    : "-"}
                </td>

                <td className="border p-2 text-center">
                  <a
                    href={`/api/invoice/${i.id}`}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    تحميل PDF
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}