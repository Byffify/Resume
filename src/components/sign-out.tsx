import { useState, type ComponentProps } from "react";
import { signOut } from "../lib/supabase";

export function SignOut({ children, ...props }: ComponentProps<"a">) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <a
      {...props}
      href="/"
      aria-disabled={busy}
      onClick={async (event) => {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        try {
          await signOut();
        } catch {
          setError("Could not sign out. Please try again.");
          setBusy(false);
        }
      }}
    >
      {error ? <span role="alert">{error}</span> : children}
    </a>
  );
}
