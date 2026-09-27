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
      id: "blog-1",
      kind: "blog",
      title: "A blog story",
      body: "First paragraph of the blog story.",
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

  const home = render("");
  assert.match(home, /ACHIEVEMENTS &amp; CERTIFICATES/);
  assert.match(home, /Example Certificate/);
  assert.match(home, /Example Academy · 2026/);
  assert.match(home, /href="https:\/\/example\.com\/certificate"/);
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
  assert.doesNotMatch(notes, /A blog story/);

  const blog = render("blog");
  assert.match(blog, /class="writing-preview"/);
  assert.match(blog, /First paragraph of the blog story/);
  assert.match(blog, /href="\/blog\/blog-1"/);
  assert.doesNotMatch(blog, /It&#x27;s About the Journey/);

  console.log("PASS: contacts, achievements, project bullets, Tech Stack, and writing previews.");
} finally {
  await vite.close();
}
