import "./globals.css";
import { headers } from "next/headers";
import PocketBase from "pocketbase";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // ✅ headers أصبحت async
  const headersList = await headers();
  const schoolId = headersList.get("x-school-id");

  let school: any = null;

  if (schoolId && process.env.NEXT_PUBLIC_PB_URL) {
    const pb = new PocketBase(process.env.NEXT_PUBLIC_PB_URL);

    try {
      school = await pb
        .collection("schools")
        .getOne(schoolId);
    } catch {
      school = null;
    }
  }

  return (
    <html lang="ar" dir="rtl">
      <body className="bg-gray-50 flex flex-col min-h-screen">

        {/* Header المدرسة */}
        {school && (
          <div className="bg-white shadow-sm border-b p-4 text-center">
            {school.logo && (
              <img
                src={`${process.env.NEXT_PUBLIC_PB_URL}/api/files/schools/${school.id}/${school.logo}`}
                className="h-16 mx-auto mb-2"
                alt="School Logo"
              />
            )}
            <h1 className="text-xl font-bold text-gray-800">
              {school.name}
            </h1>
          </div>
        )}

        {/* المحتوى */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t text-center py-4 text-sm text-gray-600">
          جميع الحقوق محفوظة © {new Date().getFullYear()}
          <span className="font-semibold">
            {" "}أ.عباس حسن آل عبد الوهاب
          </span>
        </footer>

      </body>
    </html>
  );
}