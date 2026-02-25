"use client";

import { useEffect, useState } from "react";
import pb from "@/lib/pocketbase";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await pb.collection("payments").getFullList({
      expand: "school,plan",
      sort: "-paidAt",
    });

    setInvoices(res);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">🧾 الفواتير</h1>

      <table className="w-full border text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">رقم الفاتورة</th>
            <th className="border p-2">المدرسة</th>
            <th className="border p-2">المبلغ</th>
            <th className="border p-2">التاريخ</th>
            <th className="border p-2">تحميل</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((i) => (
            <tr key={i.id}>
              <td className="border p-2">{i.invoiceNumber}</td>
              <td className="border p-2">
                {i.expand?.school?.name}
              </td>
              <td className="border p-2">{i.amount} ريال</td>
              <td className="border p-2">
                {new Date(i.paidAt).toLocaleDateString("ar-SA")}
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
          ))}
        </tbody>
      </table>
    </div>
  );
}