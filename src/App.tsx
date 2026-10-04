import { useEffect, useState } from "react";
import { legacyBlogUrl } from "./lib/writing";
import Content from "./pages/Content";
import ErrorPage from "./pages/ErrorPage";
import Login from "./pages/Login";
import { supabase } from "./lib/supabase";
import { loadContent } from "./lib/store";
import type { Entry, Profile } from "./lib/content";

export type PageData = {
  profile: Profile;
  entries: Entry[];
  owner?: boolean;
  writingUnavailable?: boolean;
  listing?: { total: number; page: number; pageSize: number; tags: string[] };
};

export default function App() {
  const [data, setData] = useState<PageData | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [loadedFor, setLoadedFor] = useState<string | null | undefined>(
    undefined,
  );
  const pathname = window.location.pathname;
  const search = window.location.search;
  const path = pathname.split("/").filter(Boolean);
  const q = Object.fromEntries(new URLSearchParams(search));
  const admin = path.length === 1 && path[0] === "admin";

  const legacyUrl = legacyBlogUrl(window.location.pathname, window.location.search, window.location.hash);
  useEffect(() => {
    if (legacyUrl) window.location.replace(legacyUrl);
  }, [legacyUrl]);

  useEffect(() => {
    if (!supabase || !admin) return;
    let active = true;
    const timeout = window.setTimeout(() => {
      if (active) setFailed(true);
    }, 15000);
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
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      active = false;
      window.clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [admin, attempt]);

  useEffect(() => {
    if (!supabase || (admin && !userId)) return;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort();
      setFailed(true);
    }, 15000);
    loadContent(admin, controller.signal, {
      path: pathname.split("/").filter(Boolean),
      q: Object.fromEntries(new URLSearchParams(search)),
    })
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result);
          setLoadedFor(userId);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true);
      })
      .finally(() => window.clearTimeout(timeout));
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [admin, userId, attempt, pathname, search]);

  useEffect(() => {
    if (data && window.location.hash) {
      document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
    }
  }, [data]);

  const invalidPath = path.length > 2 || !["", "about", "projects", "notes", "archive", "admin"].includes(path[0] ?? "")
    || (path.length > 1 && !["notes", "archive"].includes(path[0]));
  const routeTitle = !supabase ? "Set up the website connection" : failed ? "Could not load the website"
    : invalidPath ? "Page not found" : admin ? userId === null ? "Sign in as site owner" : "Owner workspace"
    : path[1] ? data?.entries.find((entry) => entry.id === path[1] && entry.kind === path[0])?.title ?? (data ? "Page not found" : "Writing")
    : ({ about: "About & experience", projects: "Projects", notes: "Notes", archive: "Archive" } as Record<string, string>)[path[0]]
      ?? (path.length ? "Page not found" : "Notes, stories & work");
  useEffect(() => {
    document.title = `${routeTitle} — ${data?.profile.name ?? "Borworn"}`;
  }, [routeTitle, data?.profile.name]);

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
  if (!data || (admin && loadedFor !== userId))
    return <main className="access" aria-busy="true"><p role="status">Loading {admin ? "owner workspace" : "portfolio"}…</p></main>;
  return <Content path={path} q={q} data={data} />;
}
