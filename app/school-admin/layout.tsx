export default function SchoolAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: 220,
          background: "#f4f4f4",
          padding: 20,
        }}
      >
        <h3>المدرسة</h3>
        <ul>
          <li>لوحة التحكم</li>
          <li>المعلمين</li>
          <li>الملفات</li>
          <li>الدروس</li>
        </ul>
      </aside>

      <main style={{ flex: 1 }}>{children}</main>
    </div>
  );
}
