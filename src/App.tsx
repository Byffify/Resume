import { useEffect, useState } from "react";
import { legacyBlogUrl } from "./lib/writing";
import Content from "./pages/Content";
import ErrorPage from "./pages/ErrorPage";
import Login from "./pages/Login";
import { supabase } from "./lib/supabase";
import { loadContent } from "./lib/store";
import type { Entry, Profile } from "./lib/content";

export type PageData = { profile: Profile; entries: Entry[]; owner?: boolean };

export default function App() {
  const [data, setData] = useState<PageData | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(
    undefined,
  );
  const path = window.location.pathname.split("/").filter(Boolean);
  const q = Object.fromEntries(new URLSearchParams(window.location.search));
  const admin = path.length === 1 && path[0] === "admin";

  const legacyUrl = legacyBlogUrl(window.location.pathname, window.location.search, window.location.hash);
  useEffect(() => {
    if (legacyUrl) window.location.replace(legacyUrl);
  }, [legacyUrl]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setUserId(session?.user.id ?? null);
    });
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) setFailed(true);
        else setUserId(data.session?.user.id ?? null);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [attempt]);

  useEffect(() => {
    if (!supabase || userId === undefined || (admin && !userId)) return;
    const controller = new AbortController();
    loadContent(admin, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          setLoadedFor(userId);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      });
    return () => controller.abort();
  }, [admin, userId, attempt]);

  useEffect(() => {
    if (data && window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    }
  }, [data]);

  if (legacyUrl) return null;
  if (!supabase)
    return (
      <main className="access">
        <h1>Set up the website connection</h1>
        <p>
          Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY to
          .env.local, then restart npm run dev. See README.md for instructions.
        </p>
      </main>
    );
  if (failed)
    return (
      <ErrorPage
        reset={() => {
          setFailed(false);
          setAttempt(attempt + 1);
        }}
      />
    );
  if (admin && userId === null) return <Login />;
  if (!data || loadedFor !== userId) return null;
  return <Content path={path} q={q} data={data} />;
}
