import "./globals.css";
import { headers } from "next/headers";
import { getServerPB } from "@/lib/serverAuth";
const pb = await getServerPB();
import ThemeProvider from "./components/ThemeProvider"; // 👈 هذا هو التعديل

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const schoolId = headersList.get("x-school-id");

  let school: any = null;

  if (schoolId && process.env.NEXT_PUBLIC_PB_URL) {
    try {
      school = await pb.collection("schools").getOne(schoolId);
    } catch {
      school = null;
    }
  }

  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
        
        <ThemeProvider>

          {/* Header المدرسة */}
          {school && (
            <div className="bg-white dark:bg-gray-900 shadow-sm border-b p-4 text-center transition-colors">
              {school.logo && (
                <img
                  src={`${process.env.NEXT_PUBLIC_PB_URL}/api/files/schools/${school.id}/${school.logo}`}
                  className="h-16 mx-auto mb-2"
                  alt="School Logo"
                />
              )}

              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {school.name}
              </h1>
            </div>
          )}

          {/* المحتوى */}
          <main className="flex-grow">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white dark:bg-gray-900 border-t text-center py-4 text-sm text-gray-600 dark:text-gray-400 transition-colors">
            جميع الحقوق محفوظة © {new Date().getFullYear()}
            <span className="font-semibold">
              {" "}أ.عباس حسن آل عبد الوهاب
            </span>
          </footer>

        </ThemeProvider>

      </body>
    </html>
  );
}