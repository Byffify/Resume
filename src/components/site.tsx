import { Entry, Profile, date, contactUrl } from "@/lib/content";
import { readingMinutes } from "@/lib/writing";
import { ArrowRight, FileText, NotebookPen } from "lucide-react";
export function Shell({
  profile: p,
  active,
  children,
}: {
  profile: Profile;
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="site">
      <header className="site-header">
        <a className="brand" href="/">
          {p.name.toLowerCase()}
          <span>.</span>
        </a>
        <nav aria-label="Main navigation">
          {[
            ["/about", "About"],
            ["/projects", "Projects"],
            ["/notes", "Notes"],
            ["/archive", "Archive"],
          ].map(([url, label]) => (
            <a
              aria-current={active === url ? "page" : undefined}
              key={url}
              href={url}
            >
              {label}
            </a>
          ))}
        </nav>
        <a className="button-link header-cta" href="/about#contact">
          Get in touch <ArrowRight size={15} />
        </a>
      </header>
      <main className="site-main">{children}</main>
      <footer className="site-footer">
        <span>
          © {new Date().getFullYear()} {p.name}. All rights reserved.
        </span>
        <div>
          <a href="/about">About</a>
          <a href="/notes">Notes</a>
          <a href="/archive">Archive</a>
        </div>
        <a href="/admin">Owner</a>
      </footer>
    </div>
  );
}
export function Tags({ tags, kind = "notes" }: { tags: string[]; kind?: Entry["kind"] }) {
  return (
    <div className="tags">
      {tags.map((t) => (
        <a key={t} href={`/${kind}?tag=${encodeURIComponent(t)}`}>
          {t}
        </a>
      ))}
    </div>
  );
}
export function Rows({ entries }: { entries: Entry[] }) {
  return (
    <div className="entry-list">
      {entries.map((e) => (
        <article className="entry-row" key={e.id}>
          <span className={"entry-icon " + e.kind}>
            {e.kind === "notes" ? (
              <NotebookPen size={17} />
            ) : (
              <FileText size={17} />
            )}
          </span>
          <a href={`/${e.kind}/${e.id}`}>{e.title}</a>
          <time className="meta">{date(e.published)}</time>
        </article>
      ))}
    </div>
  );
}
export function Contacts({ profile: p }: { profile: Profile }) {
  return (
    <div className="contacts">
      {p.contacts
        .map((c) => ({ ...c, href: contactUrl(c.url) }))
        .filter((c) => c.href)
        .map((c, i) => (
          <a key={i} href={c.href} rel="noopener noreferrer">
            {c.label} ↗
          </a>
        ))}
    </div>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="blank">{children}</div>;
}
export function ProfileAvatar() {
  return <img className="profile-avatar" src="/images/Profile.jpg" alt="" width="48" height="48"
    onError={(event) => { event.currentTarget.style.visibility = "hidden"; }} />;
}
export function Author({ name, body, published }: { name: string; body: string; published: string | null }) {
  return <div className="author">
    <ProfileAvatar />
    <div><strong>{name}</strong><span>
      {published ? <time dateTime={published}>{date(published)}</time> : "Draft"}
      {" · "}{readingMinutes(body)} min read
    </span></div>
  </div>;
}
