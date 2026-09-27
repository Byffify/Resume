export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="access">
      <h1>โหลดข้อมูลไม่สำเร็จ</h1>
      <p>กรุณาลองอีกครั้งในอีกสักครู่</p>
      <button onClick={reset}>ลองอีกครั้ง</button>
    </main>
  );
}
