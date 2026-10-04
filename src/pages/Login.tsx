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
      <h1>Sign in as site owner</h1>
      <p>Manage your profile, projects, and writing.</p>
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
              "Could not sign in. Check your email, password, and connection.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <label className="field">
          Email
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
          Password
          <Input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            disabled={busy}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <p className="access-error" role="alert">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
      <div className="access-actions"><a href="/">Back to website</a></div>
    </main>
  );
}
