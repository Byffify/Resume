import type { Entry } from "./content";

export function plainText(body: string) {
  return body.replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*`>_~]/g, "").replace(/\s+/g, " ").trim();
}

export function readingMinutes(body: string) {
  const words = [...new Intl.Segmenter(["th", "en"], { granularity: "word" })
    .segment(plainText(body))].filter((part) => part.isWordLike).length;
  return Math.max(1, Math.ceil(words / 200));
}

export function archiveGroups(entries: Entry[]) {
  const groups = new Map<string, Entry[]>();
  const formatter = new Intl.DateTimeFormat("en-GB", {
    year: "numeric", month: "long", timeZone: "Asia/Bangkok",
  });
  for (const entry of [...entries].sort((a, b) =>
    (b.published ?? "").localeCompare(a.published ?? "") || b.id.localeCompare(a.id))) {
    if (!entry.published) continue;
    const label = formatter.format(new Date(entry.published));
    groups.set(label, [...(groups.get(label) ?? []), entry]);
  }
  return [...groups];
}

export function legacyBlogUrl(pathname: string, search = "", hash = "") {
  return /^\/blog(?:\/[^/]+)?\/?$/.test(pathname)
    ? pathname.replace(/^\/blog/, "/archive") + search + hash : null;
}
