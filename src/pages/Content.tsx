import { SignOut } from "../components/sign-out";
import type { PageData } from "../App";
import { Shell, Rows, Tags, Contacts, Empty, Author } from "@/components/site";
import { ResourceCards } from "@/components/resource-cards";
import { WritingPreviews } from "@/components/writing-previews";
import { Markdown } from "@/components/markdown";
import { date, safeUrl } from "@/lib/content";
import NotFound from "./NotFound";

import Admin from "@/components/admin";
import { ArrowRight, Search } from "lucide-react";
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
    !["", "about", "projects", "notes", "blog", "admin"].includes(route) ||
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
          <SignOut>Switch account</SignOut>
        </main>
      );
    return (
      <Admin initialProfile={data.profile} initialEntries={data.entries} />
    );
  }
  const p = data.profile;
  const active = "/" + route;
  if (path[1]) {
    if (!["notes", "blog"].includes(route)) return <NotFound />;
    const e = data.entries.find((e) => e.id === path[1]);
    if (!e || e.kind !== route) return <NotFound />;
    return (
      <Shell profile={p} active={active}>
        <article className="reading">
          <a className="back" href={"/" + route}>
            ← {route === "notes" ? "All notes" : "All posts"}
          </a>
          <div className="post-paper">
            <Author name={p.name} />
            <h1>{e.title}</h1>
            <Markdown body={e.body} />
            <div className="post-end">
              <Tags tags={e.tags} />
              <p className="meta">
                Published {date(e.published)} · Updated {date(e.updated)}
              </p>
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
          <span className="eyebrow">A LITTLE ABOUT ME</span>
          <h1>More than a resume.</h1>
          <p>{p.intro}</p>
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
          </div>
          <aside>
            <h2>Skills</h2>
            <p className="preserve">{p.skills || "No skills added yet"}</p>
            <h2>Curiosities</h2>
            {interests.length ? (
              <Tags tags={interests} />
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
          <span className="eyebrow">SELECTED WORK</span>
          <h1>Things I’ve built.</h1>
          <p>Projects, the technology behind them, and what I learned along the way.</p>
        </div>
        {p.projects.length ? (
          <div className="resource-grid">
            {p.projects.map((x, i) => (
              <article className="resource-card project" key={i}>
                <h3>
                  {safeUrl(x.url) ? (
                    <a href={x.url} rel="noopener noreferrer">
                      {x.name} ↗
                    </a>
                  ) : (
                    x.name
                  )}
                </h3>
                <Markdown body={x.description} />
                <p className="meta">Tech Stack · {x.role}</p>
              </article>
            ))}
          </div>
        ) : (
          <Empty>No projects shared yet</Empty>
        )}
      </div>
    );
  else if (route === "notes" || route === "blog") {
    const all = data.entries.filter((e) => e.kind === route);
    const tags = [...new Set(all.flatMap((e) => e.tags))];
    const query = (q.q || "").toLocaleLowerCase();
    const selected = q.tag || "";
    const filtered = all.filter(
      (e) =>
        (!query ||
          (e.title + " " + e.body).toLocaleLowerCase().includes(query)) &&
        (!selected || e.tags.includes(selected)),
    );
    content = (
      <div className="inner-page">
        <div className="page-heading">
          <span className="eyebrow">
            {route === "notes" ? "THE NOTEBOOK" : "STORIES & PERSPECTIVES"}
          </span>
          <h1>
            {route === "notes"
              ? "A place for small thoughts."
              : "A little more to the story."}
          </h1>
          <p>
            {route === "notes"
              ? "Interests, lessons, and ideas still taking shape."
              : "Experiences and thoughts worth sharing."}
          </p>
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
                href={"/notes?q=" + encodeURIComponent(q.q || "")}
              >
                All notes
              </a>
              {tags.map((t) => (
                <a
                  className={selected === t ? "selected" : ""}
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
          </>
        )}
        <div className="section-label">
          <span>
            {filtered.length} {route === "notes" ? "notes" : "posts"}
          </span>
          <span>Latest first</span>
        </div>
        {filtered.length ? (
          <WritingPreviews entries={filtered} author={p.name} />
        ) : (
          <Empty>
            {query || selected
              ? "No matching notes. Try another search or select All notes."
              : "Nothing published yet"}
          </Empty>
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
                Read my story <ArrowRight size={18} />
              </a>
              <a className="button-link outline" href="/notes">
                Explore notes <ArrowRight size={18} />
              </a>
            </div>
          </div>
          <div className="hero-art">
            <img
              src="/images/notebook-collage.webp"
              alt="Collage of a notebook, coffee, and the coast"
              width="1200"
              height="900"
            />
          </div>
        </section>
        <section className="start-section">
          <h2>Start here</h2>
          <p>Get to know me through my experience, projects, and what I’m learning.</p>
          <ResourceCards
            items={[
              {
                title: "About & Resume",
                description: "My story, experience, and skills",
                href: "/about",
              },
              {
                title: "Selected projects",
                description: "What I’ve built and the technology behind it",
                href: "/projects",
              },
              {
                title: "Notes & ideas",
                description: "A collection of interests, lessons, and ideas",
                href: "/notes",
              },
            ]}
          />
        </section>
        <section className="achievements-section">
          <h2 className="eyebrow">ACHIEVEMENTS &amp; CERTIFICATES</h2>
          {p.achievements.some((item) => item.title.trim()) ? (
            <div className="resource-grid">
              {p.achievements.filter((item) => item.title.trim()).map((item, i) => (
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
            <p className="muted">Achievements and certificates will appear here.</p>
          )}
        </section>
        <section className="home-bottom">
          <div className="curiosity-column">
            <h2>Stay curious.</h2>
            <p>
              Small things that spark curiosity
              <br />
              can lead to something new.
            </p>
            {interests.length > 0 && <Tags tags={interests} />}
            <a className="text-link" href="/about#contact">
              Let’s connect <ArrowRight size={15} />
            </a>
          </div>
          {(["notes", "blog"] as const).map((kind) => (
            <div key={kind} className="latest-column">
              <div className="section-title">
                <h2>Latest {kind}</h2>
                <a href={"/" + kind}>
                  View all <ArrowRight size={13} />
                </a>
              </div>
              {entries.filter((e) => e.kind === kind).length ? (
                <Rows
                  entries={entries.filter((e) => e.kind === kind).slice(0, 3)}
                />
              ) : (
                <Empty>
                  {kind === "notes"
                    ? "No notes published yet"
                    : "No blog posts published yet"}
                </Empty>
              )}
            </div>
          ))}
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
