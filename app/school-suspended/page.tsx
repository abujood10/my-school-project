export default function SchoolSuspendedPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        textAlign: "center",
        direction: "rtl",
        fontFamily: "system-ui",
      }}
    >
      <div>
        <h1>⛔ تم إيقاف المدرسة</h1>
        <p style={{ marginTop: 10 }}>
          تم إيقاف الوصول بسبب انتهاء الاشتراك.
        </p>
        <p>يرجى التواصل مع الإدارة.</p>
      </div>
    </div>
  );
}
