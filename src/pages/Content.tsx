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
          <h1>ไม่มีสิทธิ์จัดการเว็บไซต์</h1>
          <p>กรุณาเข้าสู่ระบบด้วยบัญชีเจ้าของเว็บไซต์</p>
          <SignOut>เปลี่ยนบัญชี</SignOut>
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
                เผยแพร่ {date(e.published)} · อัปเดต {date(e.updated)}
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
                <Empty>ยังไม่ได้เพิ่มประสบการณ์</Empty>
              )}
            </section>
          </div>
          <aside>
            <h2>Skills</h2>
            <p className="preserve">{p.skills || "ยังไม่ได้เพิ่มทักษะ"}</p>
            <h2>Curiosities</h2>
            {interests.length ? (
              <Tags tags={interests} />
            ) : (
              <p className="muted">ยังไม่ได้เพิ่มหัวข้อความสนใจ</p>
            )}
            <h2 id="contact">Get in touch</h2>
            {p.contacts.length ? (
              <Contacts profile={p} />
            ) : (
              <p className="muted">ยังไม่ได้เพิ่มช่องทางติดต่อ</p>
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
          <p>ผลงาน เทคโนโลยีที่ใช้ และสิ่งที่เกิดขึ้นระหว่างทาง</p>
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
                <p>{x.description}</p>
                <p className="meta">Tech Stack · {x.role}</p>
              </article>
            ))}
          </div>
        ) : (
          <Empty>ยังไม่มีผลงานที่เผยแพร่</Empty>
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
              ? "สิ่งที่สนใจ สิ่งที่เรียนรู้ และความคิดที่ยังเติบโตได้"
              : "ประสบการณ์และความคิดที่อยากเล่าให้ฟัง"}
          </p>
        </div>
        {route === "notes" && (
          <>
            <form className="search" action="/notes">
              <Search size={18} aria-hidden="true" />
              <label className="sr-only" htmlFor="q">
                ค้นหา Notes
              </label>
              <input
                id="q"
                name="q"
                placeholder="Search notes…"
                defaultValue={q.q}
              />
              {selected && <input type="hidden" name="tag" value={selected} />}
              <button>ค้นหา</button>
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
              ? "ไม่พบบันทึกที่ตรงกับการค้นหา ลองเปลี่ยนคำค้นหรือเลือก All notes"
              : "ยังไม่มีเนื้อหาที่เผยแพร่"}
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
              alt="ภาพคอลลาจสมุดบันทึก กาแฟ และชายฝั่ง"
              width="1200"
              height="900"
            />
          </div>
        </section>
        <section className="start-section">
          <h2>Start here</h2>
          <p>รู้จักกันผ่านประสบการณ์ ผลงาน และสิ่งที่ผมกำลังเรียนรู้</p>
          <ResourceCards
            items={[
              {
                title: "About & Resume",
                description: "เรื่องราว ประสบการณ์ และทักษะของผม",
                href: "/about",
              },
              {
                title: "Selected projects",
                description: "สิ่งที่ลงมือทำ และเทคโนโลยีที่ใช้ในแต่ละงาน",
                href: "/projects",
              },
              {
                title: "Notes & ideas",
                description: "คลังความสนใจ ความรู้ และไอเดียระหว่างทาง",
                href: "/notes",
              },
            ]}
          />
        </section>
        <section className="home-bottom">
          <div className="curiosity-column">
            <h2>Stay curious.</h2>
            <p>
              เรื่องเล็ก ๆ ที่สนใจ
              <br />
              อาจเป็นจุดเริ่มต้นของสิ่งใหม่
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
                    ? "ยังไม่มี Notes ที่เผยแพร่"
                    : "ยังไม่มีบทความที่เผยแพร่"}
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
