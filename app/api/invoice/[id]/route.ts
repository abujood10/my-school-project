import { NextRequest, NextResponse } from "next/server";
import PocketBase from "pocketbase";
import { jsPDF } from "jspdf";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

  try {
    const payment = await pb.collection("payments").getOne(params.id, {
      expand: "school,plan",
    });

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("فاتورة اشتراك نظام المدارس", 20, 20);

    doc.setFontSize(12);
    doc.text(`رقم الفاتورة: ${payment.invoiceNumber}`, 20, 40);
    doc.text(`المدرسة: ${payment.expand?.school?.name}`, 20, 50);
    doc.text(`الباقة: ${payment.expand?.plan?.name}`, 20, 60);
    doc.text(`المبلغ: ${payment.amount} ريال`, 20, 70);
    doc.text(
      `التاريخ: ${new Date(payment.paidAt).toLocaleDateString("ar-SA")}`,
      20,
      80
    );

    const pdf = doc.output("arraybuffer");

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=invoice-${payment.invoiceNumber}.pdf`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }
}