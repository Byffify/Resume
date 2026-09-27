import { useState } from "react";
import { requireSupabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <main className="access">
      <span className="eyebrow">OWNER</span>
      <h1>เข้าสู่ระบบเจ้าของเว็บไซต์</h1>
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            const { error } = await requireSupabase().auth.signInWithPassword({
              email: email.trim(),
              password,
            });
            if (error) throw error;
            setPassword("");
          } catch {
            setError(
              "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจอีเมล รหัสผ่าน และการเชื่อมต่อ",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field">
          อีเมล
          <Input
            type="email"
            autoComplete="username"
            required
            value={email}
            disabled={busy}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="field">
          รหัสผ่าน
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            disabled={busy}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <p role="alert">{error}</p>
        <Button type="submit" disabled={busy}>
          {busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </Button>
      </form>
      <a href="/">กลับหน้าเว็บ</a>
    </main>
  );
}
