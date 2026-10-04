import { SignOut } from "../components/sign-out";
import type { PageData } from "../App";
import { Shell, Rows, Tags, Interests, Contacts, Empty, Author } from "@/components/site";
import { WritingPreviews } from "@/components/writing-previews";
import { Markdown } from "@/components/markdown";
import { archiveGroups } from "@/lib/writing";
import { projectPresentation } from "@/lib/projects";
import { date, safeUrl } from "@/lib/content";
import NotFound from "./NotFound";

import { lazy, Suspense } from "react";
const Admin = lazy(() => import("@/components/admin"));
import { ArrowRight, ChevronRight, Search } from "lucide-react";
export default function Content({
  path,
  q,
  data,
}: {
  path: string[];
  q: Record<string, string | undefined>;
  data: PageData;
}) {
  const route = path[0] || "";
  if (
    !["", "about", "projects", "notes", "archive", "admin"].includes(route) ||
    path.length > 2 ||
    (route === "admin" && path.length > 1)
  )
    return <NotFound />;
  if (route === "admin") {
    if (!data.owner)
      return (
        <main className="access">
          <h1>You don’t have access to the owner area</h1>
          <p>Please sign in with the site owner account.</p>
          <div className="access-actions">
            <SignOut className="button-link">Switch account</SignOut>
            <a href="/">Back to website</a>
          </div>
        </main>
      );
    return (
      <Suspense fallback={<main className="access" aria-busy="true"><p role="status">Loading owner workspace…</p></main>}>
        <Admin initialProfile={data.profile} initialEntries={data.entries} />
      </Suspense>
    );
  }
  const p = data.profile;
  const active = "/" + route;
  if (path[1]) {
    if (!["notes", "archive"].includes(route)) return <NotFound />;
    const e = data.entries.find((e) => e.id === path[1]);
    if (!e || e.kind !== route) return <NotFound />;
    return (
      <Shell profile={p} active={active}>
        <article className="reading">
          <a className="back" href={"/" + route}>
            ← {route === "notes" ? "All notes" : "All posts"}
          </a>
          <div className="post-paper">
            <Author name={p.name} body={e.body} published={e.published} />
            <h1>{e.title}</h1>
            <Markdown body={e.body} />
            <div className="post-end">
              <Tags tags={e.tags} kind={e.kind} />
              <p className="meta">
                Updated <time dateTime={e.updated}>{date(e.updated)}</time>
              </p>
              <a className="back" href={"/" + route}>
                ← {route === "notes" ? "All notes" : "All posts"}
              </a>
            </div>
          </div>
        </article>
      </Shell>
    );
  }
  const interests = p.interests
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  let content;
  if (route === "about")
    content = (
      <div className="inner-page">
        <div className="page-heading">
          <h1>About</h1>
        </div>
        <div className="about-grid">
          <div>
            <Markdown body={p.about} />
            <section id="resume">
              <h2>Experience</h2>
              {p.experience ? (
                <Markdown body={p.experience} />
              ) : (
                <Empty>No experience added yet</Empty>
              )}
            </section>
            <section className="achievements-section">
              <h2>Achievements &amp; Certificates</h2>
              {p.achievements.some((item) => item.title.trim()) ? (
                <div className="resource-grid">
                  {p.achievements
                    .filter((item) => item.title.trim())
                    .map((item, i) => (
                      <article className="resource-card" key={i}>
                        <h3>
                          {safeUrl(item.url) ? (
                            <a href={item.url} rel="noopener noreferrer">
                              {item.title} ↗
                            </a>
                          ) : (
                            item.title
                          )}
                        </h3>
                        {item.detail && <p>{item.detail}</p>}
                      </article>
                    ))}
                </div>
              ) : (
                <p className="muted">
                  Achievements and certificates will appear here.
                </p>
              )}
            </section>
          </div>
          <aside>
            {p.skills.trim() && <>
              <h2>Skills</h2>
              <p className="preserve">{p.skills}</p>
            </>}
            <h2>Curiosities</h2>
            {interests.length ? (
              <Interests items={interests} />
            ) : (
              <p className="muted">No interests added yet</p>
            )}
            <h2 id="contact">Get in touch</h2>
            {p.contacts.length ? (
              <Contacts profile={p} />
            ) : (
              <p className="muted">No contact links added yet</p>
            )}
          </aside>
        </div>
      </div>
    );
  else if (route === "projects")
    content = (
      <div className="inner-page">
        <div className="page-heading">
          <h1>Projects</h1>
        </div>
        {p.projects.length ? (
          <div className="resource-grid">
            {p.projects.map((x, i) => {
              const { summary, details } = projectPresentation(x.description);
              return (
              <article className="resource-card project" key={i}>
                <h2>
                  {safeUrl(x.url) ? (
                    <a href={x.url} rel="noopener noreferrer">
                      {x.name} ↗
                    </a>
                  ) : (
                    x.name
                  )}
                </h2>
                {summary && <p className="project-summary">{summary}</p>}
                {x.role.trim() && <div className="project-stack">
                  <h3>Tech Stack</h3>
                  <p>{x.role}</p>
                </div>}
                {details && <details className="project-details">
                  <summary><ChevronRight className="disclosure-chevron" size={16} aria-hidden="true" />Contribution &amp; details<span className="sr-only">: {x.name}</span></summary>
                  <Markdown body={details} />
                </details>}
              </article>
            );})}
          </div>
        ) : (
          <Empty>No projects shared yet</Empty>
        )}
      </div>
    );
  else if (route === "notes" || route === "archive") {
    const all = data.entries.filter((e) => e.kind === route);
    const tags = data.listing?.tags ?? [...new Set(all.flatMap((e) => e.tags))];
    const query = (q.q || "").toLocaleLowerCase();
    const selected = q.tag || "";
    const filtered = data.listing ? all : all.filter(
      (e) =>
        (!query ||
          (e.title + " " + e.body).toLocaleLowerCase().includes(query)) &&
        (!selected || e.tags.includes(selected)),
    );
    const total = data.listing?.total ?? filtered.length;
    content = (
      <div className="inner-page">
        <div className="page-heading">
          <h1>{route === "notes" ? "Notes" : "Archive"}</h1>
          {route === "archive" && <p className="archive-intro">
            Weekly AI and tech roundups, curated by me.
          </p>}
        </div>
        {route === "notes" && (
          <>
            <form className="search" action="/notes">
              <Search size={18} aria-hidden="true" />
              <label className="sr-only" htmlFor="q">
                Search notes
              </label>
              <input
                id="q"
                type="search"
                name="q"
                placeholder="Search notes…"
                defaultValue={q.q}
              />
              {selected && <input type="hidden" name="tag" value={selected} />}
              <button>Search</button>
            </form>
            <div className="filters">
              <a
                className={!selected ? "selected" : ""}
                aria-current={!selected ? "true" : undefined}
                href={"/notes?q=" + encodeURIComponent(q.q || "")}
              >
                All notes
              </a>
              {tags.map((t) => (
                <a
                  className={selected === t ? "selected" : ""}
                  aria-current={selected === t ? "true" : undefined}
                  key={t}
                  href={
                    "/notes?tag=" +
                    encodeURIComponent(t) +
                    "&q=" +
                    encodeURIComponent(q.q || "")
                  }
                >
                  {t}
                </a>
              ))}
            </div>
            {(query || selected) && <p className="search-context">
              {query && <span>Search: “{q.q}”</span>}
              {selected && <span>Tag: {selected}</span>}
              <a className="text-link" href="/notes">Clear search and filters</a>
            </p>}
          </>
        )}
        <div className="section-label">
          <span>
            {total} {route === "notes" ? total === 1 ? "note" : "notes" : total === 1 ? "post" : "posts"}
          </span>
          <span>Latest first</span>
        </div>
        {filtered.length ? (
          route === "archive" ? (
            <div className="archive-groups">
              {archiveGroups(filtered).map(([month, entries]) => (
                <section className="archive-month" key={month}>
                  <h2>{month}</h2>
                  <WritingPreviews entries={entries} author={p.name} headingLevel={3} />
                </section>
              ))}
            </div>
          ) : <WritingPreviews entries={filtered} author={p.name} />
        ) : (
          route === "archive" ? <Empty>
            <p>No roundups published yet.</p>
            <p>For personal stories and things I’ve learned, <a className="text-link" href="/notes">explore Notes</a>.</p>
          </Empty> : <Empty>
            {query || selected
              ? "No matching notes. Try another search or clear the filters."
              : "Nothing published yet"}
          </Empty>
        )}
        {data.listing && data.listing.total > data.listing.pageSize && (
          <nav className="pagination" aria-label="Writing pages">
            {data.listing.page > 1 && <a className="button-link outline" href={pageUrl(route, q, data.listing.page - 1)}>Previous</a>}
            <span className="muted">Page {data.listing.page} of {Math.ceil(data.listing.total / data.listing.pageSize)}</span>
            {data.listing.page * data.listing.pageSize < data.listing.total && <a className="button-link outline" href={pageUrl(route, q, data.listing.page + 1)}>Next</a>}
          </nav>
        )}
      </div>
    );
  } else {
    const entries = data.entries;
    content = (
      <>
        <section className="home-hero">
          <div className="hero-copy">
            <h1>
              Hi, I’m
              <br />
              <span>{p.name}.</span>
            </h1>
            <p>{p.intro}</p>
            <div className="hero-actions">
              <a className="button-link" href="/about">
                About &amp; experience <ArrowRight size={18} />
              </a>
              <a className="button-link outline" href="/notes">
                Explore notes <ArrowRight size={18} />
              </a>
            </div>
          </div>
          <div className="hero-art">
            <img
              src="/images/Profile.jpg"
              alt="Portrait of Borworn"
              width="320"
              height="400"
            />
          </div>
        </section>
        <section className="home-bottom">
          {(["notes", "archive"] as const).map((kind) => (
            <div key={kind} className={"latest-column latest-" + kind}>
              <div className="section-title">
                <h2>Latest {kind}</h2>
                <a href={"/" + kind}>
                  View all <ArrowRight size={13} />
                </a>
              </div>
              {kind === "archive" && <p className="muted archive-description">Weekly AI and tech roundups, curated by me.</p>}
              {entries.filter((e) => e.kind === kind).length ? (
                <Rows
                  entries={entries.filter((e) => e.kind === kind).slice(0, 3)}
                />
              ) : (
                <Empty>
                  {data.writingUnavailable ? "Writing could not be loaded. Open View all to try again." : kind === "notes"
                    ? "No notes published yet"
                    : <>No roundups published yet. <a className="text-link" href="/notes">Explore Notes</a></>}
                </Empty>
              )}
            </div>
          ))}
          <div className="curiosity-column">
            <h2>Interests</h2>
            {interests.length > 0 && <Interests items={interests} />}
            <a className="text-link" href="/about#contact">
              Let’s connect <ArrowRight size={15} />
            </a>
          </div>
        </section>
      </>
    );
  }
  return (
    <Shell profile={p} active={active}>
      {content}
    </Shell>
  );
}

function pageUrl(route: string, q: Record<string, string | undefined>, page: number) {
  const params = new URLSearchParams();
  if (q.q) params.set("q", q.q);
  if (q.tag) params.set("tag", q.tag);
  params.set("page", String(page));
  return `/${route}?${params}`;
}
