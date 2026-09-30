import assert from "node:assert/strict";
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
  assert.match(projects, /Tech Stack · React, TypeScript/);
  assert.match(projects, /<ul><li>First feature<\/li><li>Second feature<\/li><\/ul>/);
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
  assert.match(notes, /src="\/images\/Profile.jpg"/);
  assert.match(notes, /dateTime="2026-09-26T00:00:00Z"/i);
  assert.match(notes, /26 Sept 2026/);
  assert.match(notes, /1 min read/);
  assert.doesNotMatch(notes, /Notes &amp; thoughts|A place for small thoughts|>Resume<|>Blog</);
  assert.match(about, /id="resume"/);
  const detail = renderToStaticMarkup(React.createElement(Content, { path: ["notes", "note-1"], q: {}, data: { profile, entries } }));
  assert.match(detail, /1 min read/);
  assert.match(detail, /src="\/images\/Profile.jpg"/);
  assert.match(archive, /September 2026/);
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
  console.log("PASS: contacts, achievements, project bullets, Tech Stack, and writing previews.");
} finally {
  await vite.close();
}
