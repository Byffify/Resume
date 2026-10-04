import { Author, ProfileAvatar } from "./site";
import { saveContent } from "../lib/store";
import { SignOut } from "./sign-out";
// Sidebar composition adapted from Watermelon UI Agndex. See WATERMELON-LICENSE.txt.
import { useEffect, useRef, useState, CSSProperties } from "react";
import { Profile, Entry, date, safeUrl } from "@/lib/content";
import { Markdown } from "./markdown";
import { ProfileForm } from "./profile-form";
import { useDraftTool } from "./draft-tool";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Home,
  FileUser,
  Folder,
  NotebookPen,
  Newspaper,
  ArrowUpRight,
  LogOut,
  Search,
  Plus,
  Bold,
  Italic,
  Heading2,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  List,
  Eye,
  Pencil,
} from "lucide-react";

type Draft = Omit<Entry, "id" | "created" | "updated" | "published"> &
  Partial<Entry>;
type View = "all" | "notes" | "archive" | "profile" | "projects";
const fresh = (kind: "notes" | "archive" = "notes"): Draft => ({
  kind,
  title: "",
  body: "",
  tags: [],
  status: "draft",
});
function OwnerNav({
  name,
  view,
  change,
  busy,
}: {
  name: string;
  view: View;
  change: (v: View) => void;
  busy: boolean;
}) {
  const { isMobile, setOpenMobile } = useSidebar();
  return (
    <Sidebar className="owner-sidebar">
      <SidebarHeader>
        <a className="brand" href="/">
          {name.toLowerCase()}
          <span>.</span>
        </a>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {(
            [
              { id: "all", label: "Overview", icon: Home },
              { id: "profile", label: "Resume", icon: FileUser },
              { id: "projects", label: "Projects", icon: Folder },
              { id: "notes", label: "Notes", icon: NotebookPen },
              { id: "archive", label: "Archive", icon: Newspaper },
            ] as const
          ).map((n) => (
            <SidebarMenuItem key={n.id}>
              <SidebarMenuButton
                disabled={busy}
                isActive={view === n.id}
                onClick={() => {
                  change(n.id);
                  if (isMobile) setOpenMobile(false);
                }}
              >
                <n.icon />
                <span>{n.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/" target="_blank">
                <ArrowUpRight />
                <span>View website</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <SignOut>
                <LogOut />
                <span>Sign out</span>
              </SignOut>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
export default function Admin({
  initialProfile,
  initialEntries,
}: {
  initialProfile: Profile;
  initialEntries: Entry[];
}) {
  const [profile, setProfile] = useState(initialProfile),
    [entries, setEntries] = useState(initialEntries),
    [draft, setDraft] = useState<Draft>(fresh),
    [tagText, setTagText] = useState(""),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [dirty, setDirty] = useState(false),
    [profileDirty, setProfileDirty] = useState(false),
    [view, setView] = useState<View>("all"),
    [search, setSearch] = useState(""),
    [preview, setPreview] = useState(false),
    [pending, setPending] = useState<{ entry?: Entry } | null>(null),
    [insert, setInsert] = useState<"link" | "image" | null>(null),
    [url, setUrl] = useState(""),
    [caption, setCaption] = useState("");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const editorRef = useRef<HTMLElement>(null);
  useDraftTool((input) => {
    if (dirty || busy)
      throw Error("Save the current draft before staging another.");
    setDraft({ ...fresh(input.kind), ...input });
    setTagText(input.tags.join(", "));
    setDirty(true);
    setView(input.kind);
    setPreview(false);
    setMessage("");
  });
  useEffect(() => {
    const f = (e: BeforeUnloadEvent) => {
      if (dirty || profileDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", f);
    return () => window.removeEventListener("beforeunload", f);
  }, [dirty, profileDirty]);
  function update(p: Partial<Draft>) {
    setDraft({ ...draft, ...p });
    setDirty(true);
    setMessage("");
  }
  function switchEntry(e?: Entry) {
    setDraft(e || fresh(view === "archive" ? "archive" : "notes"));
    setTagText(e?.tags.join(", ") || "");
    setDirty(false);
    setPreview(false);
    setMessage("");
    if (window.innerWidth < 1100)
      editorRef.current?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
        block: "start",
      });
  }
  function edit(e?: Entry) {
    if (dirty) {
      setPending({ entry: e });
      return;
    }
    switchEntry(e);
  }
  function markup(before: string, after = "") {
    const el = bodyRef.current;
    const start = el?.selectionStart ?? draft.body.length,
      end = el?.selectionEnd ?? start;
    update({
      body:
        draft.body.slice(0, start) +
        before +
        draft.body.slice(start, end) +
        after +
        draft.body.slice(end),
    });
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + before.length, end + before.length);
    });
  }
  async function save(data: unknown, isProfile = false) {
    setBusy(true);
    setMessage("");
    try {
      const result = await saveContent(data);
      if (result.entry) {
        const saved = result.entry;
        setDraft(saved);
        setEntries((old) => [saved, ...old.filter((x) => x.id !== saved.id)]);
        setDirty(false);
      }
      if (isProfile) setProfileDirty(false);
      setMessage("Saved successfully");
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Could not save. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  const saveEntry = (status = draft.status) =>
    save({
      ...draft,
      tags: tagText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      status,
    });
  const filtered = entries.filter(
    (e) =>
      (view === "all" || e.kind === view) &&
      (e.title + " " + e.body + " " + e.tags.join(" "))
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const counts = [
    {
      label: "Drafts",
      count: entries.filter((e) => e.status === "draft").length,
    },
    {
      label: "Published",
      count: entries.filter((e) => e.status === "published").length,
    },
    {
      label: "Notes this month",
      count: entries.filter(
        (e) =>
          e.kind === "notes" &&
          e.created.slice(0, 7) === new Date().toISOString().slice(0, 7),
      ).length,
    },
  ];
  const insertCaption = caption.replace(/[[\]]/g, "").trim();
  return (
    <SidebarProvider
      className="owner-app"
      style={{ "--sidebar-width": "12rem" } as CSSProperties}
    >
      <OwnerNav name={profile.name} view={view} change={setView} busy={busy} />
      <div className="owner-main">
        <header className="owner-topbar">
          <div className="breadcrumb">
            <SidebarTrigger />
            <span>Owner</span>
            <span>/</span>
            <span>
              {view === "profile"
                ? "Resume"
                : view === "all"
                  ? "Overview"
                  : view.charAt(0).toUpperCase() + view.slice(1)}
            </span>
          </div>
          <div className="owner-identity">
            <ProfileAvatar />
            {profile.name}
          </div>
        </header>
        <main>
          <div className="save-status" role="status" aria-live="polite">
            {message ||
              (dirty || profileDirty
                ? "You have unsaved changes"
                : "")}
          </div>
          {view === "profile" || view === "projects" ? (
            <ProfileForm
              profile={profile}
              onChange={(p) => {
                setProfile(p);
                setProfileDirty(true);
              }}
              save={() => save({ action: "profile", profile }, true)}
              busy={busy}
              view={view}
            />
          ) : (
            <div className="workspace-grid">
              <section className="library-panel">
                <div className="workspace-heading">
                  <h1>Writing</h1>
                </div>
                <div className="writing-stats">
                  {counts.map((c, i) => (
                    <div key={c.label}>
                      <span>{c.label}</span>
                      <strong className={"stat-" + i}>
                        {String(c.count).padStart(2, "0")}
                      </strong>
                    </div>
                  ))}
                </div>
                <label className="library-search">
                  <Search size={17} />
                  <Input
                    aria-label="Search your writing"
                    placeholder="Search your writing…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <div className="library-controls">
                  <div className="library-filters" role="group" aria-label="Filter writing by type">
                    {([
                      ["all", "All"],
                      ["notes", "Notes"],
                      ["archive", "Archive"],
                    ] as const).map(([value, label]) => (
                      <Button
                        key={value}
                        type="button"
                        variant="ghost"
                        className="library-filter"
                        aria-pressed={view === value}
                        aria-controls="writing-library"
                        disabled={busy}
                        onClick={() => setView(value)}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => edit()}
                    disabled={busy}
                  >
                    <Plus />
                    New post
                  </Button>
                </div>
                <div className="writing-table" id="writing-library" role="region" aria-label="Writing library">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Updated</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map((e) => (
                        <TableRow key={e.id} data-selected={draft.id === e.id}>
                          <TableCell>
                            <button
                              disabled={busy}
                              className="entry-select"
                              onClick={() => edit(e)}
                            >
                              <strong>{e.title}</strong>
                              <span>
                                {e.kind === "notes" ? "Note" : "Archive"}
                                {e.tags.length ? " · " + e.tags.join(", ") : ""}
                              </span>
                            </button>
                          </TableCell>
                          <TableCell>
                            <span className={"status-badge " + e.status}>
                              {e.status === "draft" ? "Draft" : "Published"}
                            </span>
                          </TableCell>
                          <TableCell className="date-cell">
                            {date(e.updated)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {!filtered.length && (
                    <p className="blank">
                      {search
                        ? "No writing matches your search"
                        : "Start with your first post"}
                    </p>
                  )}
                </div>
              </section>
              <section className="writing-editor" ref={editorRef}>
                <div className="editor-actionbar">
                  <Button
                    variant="outline"
                    disabled={busy || !draft.title.trim()}
                    onClick={() => saveEntry()}
                  >
                    {busy
                      ? "Saving…"
                      : draft.status === "published"
                        ? "Save changes"
                        : "Save draft"}
                  </Button>
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => setPreview(!preview)}
                  >
                    {preview ? <Pencil /> : <Eye />}
                    {preview ? "Write" : "Preview"}
                  </Button>
                  <Button
                    className="publish-button"
                    disabled={busy || !draft.title.trim()}
                    onClick={() =>
                      saveEntry(
                        draft.status === "published" ? "draft" : "published",
                      )
                    }
                  >
                    {draft.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                </div>
                <fieldset disabled={busy}>
                  <label className="field">
                    Title
                    <Input
                      value={draft.title}
                      maxLength={200}
                      onChange={(e) => update({ title: e.target.value })}
                      placeholder="Start with a small thought"
                    />
                  </label>
                  <div className="editor-meta">
                    <label className="field">
                      Type
                      <Select
                        value={draft.kind}
                        disabled={!!draft.id || busy}
                        onValueChange={(v) =>
                          update({ kind: v as "notes" | "archive" })
                        }
                      >
                        <SelectTrigger
                          className="type-select"
                          aria-label="Type"
                        >
                          <SelectValue>
                            {draft.kind === "notes" ? "Note" : "Archive"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notes">Note</SelectItem>
                          <SelectItem value="archive">Archive</SelectItem>
                        </SelectContent>
                      </Select>
                    </label>
                    <label className="field">
                      Tags
                      <Input
                        value={tagText}
                        onChange={(e) => {
                          setTagText(e.target.value);
                          setDirty(true);
                        }}
                        placeholder="writing, ideas"
                      />
                    </label>
                  </div>
                  <div className="paper-editor">
                    <div
                      className="format-toolbar"
                      aria-label="Text formatting"
                    >
                      {[
                        { label: "Heading", icon: Heading2, start: "\n# " },
                        { label: "Bold", icon: Bold, start: "**", end: "**" },
                        { label: "Italic", icon: Italic, start: "*", end: "*" },
                        { label: "Quote", icon: Quote, start: "\n> " },
                        {
                          label: "Code block",
                          icon: Code,
                          start: "\n```js\n",
                          end: "\n```\n",
                        },
                        { label: "List", icon: List, start: "\n- " },
                      ].map((t) => (
                        <Button
                          type="button"
                          key={t.label}
                          variant="ghost"
                          size="icon"
                          aria-label={t.label}
                          title={t.label}
                          disabled={preview}
                          onClick={() => markup(t.start, t.end)}
                        >
                          <t.icon />
                        </Button>
                      ))}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Insert link"
                        title="Insert link"
                        disabled={preview}
                        onClick={() => {
                          setInsert("link");
                          setUrl("");
                          setCaption("");
                        }}
                      >
                        <LinkIcon />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Insert image"
                        title="Insert image"
                        disabled={preview}
                        onClick={() => {
                          setInsert("image");
                          setUrl("");
                          setCaption("");
                        }}
                      >
                        <ImageIcon />
                      </Button>
                    </div>
                    {preview ? (
                      <div className="editor-preview">
                        <Author name={profile.name} body={draft.body} published={draft.status === "published" ? draft.published ?? null : null} />
                        <h2>{draft.title || "Untitled"}</h2>
                        <Markdown body={draft.body} />
                      </div>
                    ) : (
                      <Textarea
                        ref={bodyRef}
                        aria-label="Content"
                        className="body-editor"
                        rows={18}
                        value={draft.body}
                        onChange={(e) => update({ body: e.target.value })}
                        placeholder="Write what you’d like to remember…"
                      />
                    )}
                  </div>
                  <div className="editor-footnote">
                    <span>Markdown · Separate tags with commas</span>
                    <span className={"status-badge " + draft.status}>
                      {draft.status === "draft" ? "Draft" : "Published"}
                    </span>
                  </div>
                  {draft.id && draft.status === "published" && (
                    <a
                      className="text-link"
                      href={`/${draft.kind}/${draft.id}`}
                      target="_blank"
                    >
                      Open post <ArrowUpRight size={15} />
                    </a>
                  )}
                </fieldset>
              </section>
            </div>
          )}
        </main>
      </div>
      <AlertDialog
        open={!!pending}
        onOpenChange={(open) => {
          if (!open) setPending(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              Discard your changes and open another entry?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep writing</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                switchEntry(pending?.entry);
                setPending(null);
              }}
            >
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog
        open={!!insert}
        onOpenChange={(open) => {
          if (!open) setInsert(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {insert === "image" ? "Insert image" : "Insert link"}
            </DialogTitle>
            <DialogDescription>
              {insert === "image"
                ? "Describe the image and enter a publicly accessible HTTPS image URL"
                : "Enter the link text and URL"}
            </DialogDescription>
          </DialogHeader>
          <label className="field">
            {insert === "image" ? "Image description" : "Link text"}
            <Input
              required
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
          </label>
          <label className="field">
            URL
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
            />
          </label>
          <DialogFooter>
            <Button
              disabled={!safeUrl(url, insert === "image") || !insertCaption}
              onClick={() => {
                if (!insertCaption || !safeUrl(url, insert === "image")) return;
                markup(
                  `${insert === "image" ? "!" : ""}[${insertCaption}](${url.replace(/\)/g, "%29")})`,
                );
                setInsert(null);
              }}
            >
              Insert
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
