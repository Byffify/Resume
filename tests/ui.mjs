import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const [{ default: Content }, { defaultProfile }, { bulletEdit }, { profileSchema }] = await Promise.all([
    vite.ssrLoadModule("/src/pages/Content.tsx"),
    vite.ssrLoadModule("/src/lib/content.ts"),
    vite.ssrLoadModule("/src/lib/bullet-list.ts"),
    vite.ssrLoadModule("/src/lib/validation.ts"),
  ]);
  const profile = {
    ...defaultProfile,
    contacts: [
      { label: "Instagram", url: "https://www.instagram.com/fiatkul/" },
      { label: "Github", url: "https://github.com/Byffify" },
      { label: "Linkedin", url: "www.linkedin.com/in/borworn-kultumyotin-4b02b6328" },
    ],
    projects: [
      { name: "Example", description: "- First feature\n- Second feature", role: "React, TypeScript", url: "" },
    ],
    achievements: [
      { title: "Example Certificate", detail: "Example Academy · 2026", url: "https://example.com/certificate" },
    ],
  };
  const entries = [
    {
      id: "note-1",
      kind: "notes",
      title: "It's About the Journey, Not the Destination",
      body: "I think we should care more about **the process** than the end result.",
      tags: ["Writing"],
      status: "published",
      created: "2026-09-26T00:00:00Z",
      updated: "2026-09-26T00:00:00Z",
      published: "2026-09-26T00:00:00Z",
    },
    {
      id: "archive-1",
      kind: "archive",
      title: "A archive story",
      body: "First paragraph of the archive story.",
      tags: [],
      status: "published",
      created: "2026-09-26T00:00:00Z",
      updated: "2026-09-26T00:00:00Z",
      published: "2026-09-26T00:00:00Z",
    },
  ];
  const render = (path) => renderToStaticMarkup(
    React.createElement(Content, { path: [path], q: {}, data: { profile, entries } }),
  );

  const about = render("about");
  for (const contact of profile.contacts) {
    assert.match(about, new RegExp(contact.label));
  }
  assert.match(about, /href="https:\/\/www\.linkedin\.com\/in\/borworn-kultumyotin-4b02b6328"/);
  assert.match(about, /Achievements &amp; Certificates/);
  assert.match(about, /Example Certificate/);
  assert.match(about, /Example Academy · 2026/);
  assert.match(about, /href="https:\/\/example\.com\/certificate"/);

  const home = render("");
  assert.doesNotMatch(home, /Achievements &amp; Certificates/);
  assert.doesNotMatch(home, /Example Certificate/);
  assert.deepEqual(profileSchema.parse({ ...profile, achievements: undefined }).achievements, []);

  const projects = render("projects");
  assert.match(projects, /<h3>Tech Stack<\/h3><p>React, TypeScript<\/p>/);
  assert.match(projects, /<ul><li>First feature<\/li><li>Second feature<\/li><\/ul>/);
  const enriched = {
    ...profile, interests: "Investment, Case Competition", skills: "  ",
    projects: [{ name: "Reservation system", role: "React", url: "", description:
      "- Owned course reservation (PBI11) and study plan declaration (PBI7) end-to-end, building accessible selection flows\n- Added regression tests" }],
  };
  const renderEnriched = (path) => renderToStaticMarkup(React.createElement(Content, {
    path: [path], q: {}, data: { profile: enriched, entries },
  }));
  for (const path of ["", "about"]) {
    const page = renderEnriched(path);
    assert.match(page, /Case Competition/);
    assert.doesNotMatch(page, /href="\/notes\?tag=Case%20Competition"/);
  }
  assert.doesNotMatch(renderEnriched("about"), />Skills<|No skills added yet/);
  const withSkills = renderToStaticMarkup(React.createElement(Content, {
    path: ["about"], q: {}, data: { profile: { ...enriched, skills: "Testing" }, entries },
  }));
  assert.match(withSkills, />Skills<\/h2>/);
  assert.match(withSkills, /Testing/);
  const projectPage = renderEnriched("projects");
  assert.doesNotMatch(projectPage, /PBI11|PBI7/);
  assert.match(projectPage, /Added regression tests/);
  assert.match(projectPage, /<details class="project-details"><summary>/);
  assert.ok(enriched.projects[0].description.includes("PBI11"), "Public presentation must not modify owner content");
  const emptyArchive = renderToStaticMarkup(React.createElement(Content, {
    path: ["archive"], q: {}, data: { profile, entries: [] },
  }));
  assert.match(emptyArchive, /Weekly AI and tech roundups/);
  assert.match(emptyArchive, /No roundups published yet/);
  assert.match(emptyArchive, /href="\/notes">explore Notes<\/a>/);
  assert.deepEqual(bulletEdit("", 0, 0, "-"), { value: "- ", caret: 2 });
  assert.deepEqual(bulletEdit("- First", 7, 7, "Enter"), { value: "- First\n- ", caret: 10 });
  assert.deepEqual(bulletEdit("- First\n- ", 10, 10, "Enter"), { value: "- First\n", caret: 8 });

  const notes = render("notes");
  assert.match(notes, /class="writing-preview"/);
  assert.match(notes, /Borworn/);
  assert.match(notes, /It&#x27;s About the Journey, Not the Destination/);
  assert.match(notes, /the process than the end result/);
  assert.match(notes, /href="\/notes\/note-1"/);
  assert.doesNotMatch(notes, /A archive story/);

  const archive = render("archive");
  assert.match(archive, /class="writing-preview"/);
  assert.match(archive, /First paragraph of the archive story/);
  assert.match(archive, /href="\/archive\/archive-1"/);
  assert.doesNotMatch(archive, /It&#x27;s About the Journey/);

  const [{ readingMinutes, archiveGroups, legacyBlogUrl }, { ProfileAvatar, Author }] = await Promise.all([
    vite.ssrLoadModule("/src/lib/writing.ts"), vite.ssrLoadModule("/src/components/site.tsx"),
  ]);
  assert.match(notes, /class="preview-meta"/);
  assert.doesNotMatch(notes, /class="profile-avatar"/);
  assert.match(notes, /dateTime="2026-09-26T00:00:00Z"/i);
  assert.match(notes, /26 Sept 2026/);
  assert.match(notes, /1 min read/);
  assert.doesNotMatch(notes, /Notes &amp; thoughts|A place for small thoughts|>Resume<|>Blog</);
  assert.match(about, /id="resume"/);
  assert.match(about, /href="#main-content">Skip to content<\/a>/);
  assert.match(about, /id="main-content" tabindex="-1"/);
  const searchPage = renderToStaticMarkup(React.createElement(Content, {
    path: ["notes"], q: { q: "journey", tag: "Writing" },
    data: { profile, entries, listing: { total: 45, page: 2, pageSize: 20, tags: ["Writing"] } },
  }));
  assert.match(searchPage, /href="\/notes">Clear search and filters<\/a>/);
  assert.match(searchPage, /aria-label="Writing pages"/);
  assert.match(searchPage, /Page 2 of 3/);
  assert.match(searchPage, /href="\/notes\?q=journey&amp;tag=Writing&amp;page=1"/);
  assert.match(searchPage, /href="\/notes\?q=journey&amp;tag=Writing&amp;page=3"/);
  const detail = renderToStaticMarkup(React.createElement(Content, { path: ["notes", "note-1"], q: {}, data: { profile, entries } }));
  assert.match(detail, /1 min read/);
  assert.match(detail, /src="\/images\/Profile.jpg"/);
  assert.equal((detail.match(/href="\/notes">← All notes<\/a>/g) || []).length, 2);
  const singleNote = renderToStaticMarkup(React.createElement(Content, {
    path: ["notes"], q: {}, data: { profile, entries: [entries[0]] },
  }));
  assert.match(singleNote, /<span>1 note<\/span>/);
  const [{ default: Login }, { default: ErrorPage }, { default: NotFound }, { ProfileForm }] = await Promise.all([
    vite.ssrLoadModule("/src/pages/Login.tsx"),
    vite.ssrLoadModule("/src/pages/ErrorPage.tsx"),
    vite.ssrLoadModule("/src/pages/NotFound.tsx"),
    vite.ssrLoadModule("/src/components/profile-form.tsx"),
  ]);
  const login = renderToStaticMarkup(React.createElement(Login));
  assert.doesNotMatch(login, /role="alert"/);
  for (const page of [Login, ErrorPage, NotFound]) {
    assert.match(renderToStaticMarkup(React.createElement(page, { reset: () => {} })), /href="\/">Back to website/);
  }
  const profileForm = renderToStaticMarkup(React.createElement(ProfileForm, {
    profile, onChange: () => {}, save: () => {}, busy: false, view: "profile",
  }));
  assert.match(profileForm, /aria-label="Remove contact: Instagram"/);
  assert.match(profileForm, /aria-label="Remove achievement: Example Certificate"/);
  assert.match(archive, /September 2026/);
  assert.match(archive, /<h3><a href="\/archive\/archive-1"/);
  assert.match(projects, /<h2>Example<\/h2>/);
  assert.equal(readingMinutes("word ".repeat(201)), 2);
  assert.equal(readingMinutes("สวัสดีครับ วันนี้เรียนรู้เรื่องเทคโนโลยี"), 1);
  assert.equal(readingMinutes(""), 1);
  assert.equal(readingMinutes("word ".repeat(401)), 3);
  assert.equal(readingMinutes("![photo](https://example.com/photo.jpg)"), 1);
  assert.equal(legacyBlogUrl("/blog/archive-1", "?q=AI", "#sources"), "/archive/archive-1?q=AI#sources");
  assert.equal(legacyBlogUrl("/blog", "?tag=AI"), "/archive?tag=AI");
  assert.equal(legacyBlogUrl("/blog/too/many"), null);
  const groups = archiveGroups([
    { ...entries[1], id: "old", published: "2025-12-01T00:00:00Z" },
    { ...entries[1], id: "boundary", published: "2026-09-30T18:00:00Z" },
    entries[1],
  ]);
  assert.deepEqual(groups.map(([label]) => label), ["October 2026", "September 2026", "December 2025"]);
  const avatar = ProfileAvatar();
  const image = { style: {} };
  avatar.props.onError({ currentTarget: image });
  assert.equal(image.style.visibility, "hidden");
  assert.equal(avatar.props.alt, "");
  assert.match(renderToStaticMarkup(React.createElement(Author, {name: "Borworn", body: "draft", published: null})), /Draft/);
  const [{ default: Admin }, { Markdown }] = await Promise.all([
    vite.ssrLoadModule("/src/components/admin.tsx"),
    vite.ssrLoadModule("/src/components/markdown.tsx"),
  ]);
  const owner = renderToStaticMarkup(React.createElement(Admin, {
    initialProfile: profile, initialEntries: entries,
  }));
  assert.doesNotMatch(owner, /role="tab"/);
  assert.match(owner, /role="group" aria-label="Filter writing by type"/);
  assert.equal((owner.match(/aria-pressed="true"/g) || []).length, 1);
  assert.equal((owner.match(/aria-pressed="false"/g) || []).length, 2);
  assert.match(owner, /id="writing-library" role="region" aria-label="Writing library"/);
  for (const [, id] of owner.matchAll(/aria-controls="([^"]+)"/g)) {
    assert.ok(owner.includes(`id="${id}"`), `Missing controlled region: ${id}`);
  }
  const markdown = (body) => renderToStaticMarkup(React.createElement(Markdown, { body }));
  for (const caption of ["", " ", "\u2003"]) {
    assert.match(markdown(`[${caption}](https://example.com)`), />https:\/\/example.com<\/a>/);
  }
  assert.match(markdown("[Read more](https://example.com)"), />Read more<\/a>/);
  assert.doesNotMatch(markdown("[](javascript:alert)"), /<a /);
  assert.match(markdown("![Portrait](https://example.com/photo.jpg)"), /alt="Portrait"/);
  const css = await readFile(new URL("../src/index.css", import.meta.url), "utf8");
  const tokens = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*([^;]+);/g)]
    .map(([, name, value]) => [name, value.trim()]));
  const resolveColor = (value) => value.startsWith("var(")
    ? resolveColor(tokens[value.slice(6, -1)]) : value;
  const luminance = (color) => resolveColor(color).slice(1).match(/../g)
    .map((channel) => parseInt(channel, 16) / 255)
    .map((channel) => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
    .reduce((sum, channel, i) => sum + channel * [0.2126, 0.7152, 0.0722][i], 0);
  for (const [foreground, background, minimum] of [
    [tokens["muted-foreground"], tokens.background, 4.5],
    [tokens["muted-foreground"], "#f6f4ee", 4.5],
    [tokens["status-draft"], "#fff9f3", 4.5],
    ["#ffffff", tokens.publish, 4.5],
    [tokens["accent-foreground"], tokens.accent, 4.5],
    [tokens["sidebar-accent-foreground"], tokens["sidebar-accent"], 4.5],
    [tokens.ring, "#ffffff", 3],
    [tokens.ring, "#fffdfa", 3],
  ]) {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= minimum,
      `Insufficient contrast: ${foreground} on ${background}`);
  }
  console.log("PASS: named writing filters with valid control relationships; readable links including empty and whitespace captions.");
  console.log("PASS: secondary text, publication states, accent text, and field focus contrast.");
  console.log("PASS: contacts, achievements, project bullets, Tech Stack, and writing previews.");
} finally {
  await vite.close();
}
