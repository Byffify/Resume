import { plainText } from "./writing";

// Keep owner content intact; omit internal backlog references in public copy.
export function projectPresentation(description: string) {
  const details = description.replace(/\s*\(PBI[ -]?\d+(?:\s*[,/&]\s*PBI[ -]?\d+)*\)/gi, "").trim();
  const firstLine = details.split(/\r?\n/).find((line) => line.trim()) ?? "";
  const text = plainText(firstLine.replace(/^\s*(?:-\s+|#{1,3}\s+)/, ""));
  const sentence = [...new Intl.Segmenter("en", { granularity: "sentence" }).segment(text)][0]?.segment.trim() ?? "";
  // Reuse the opening contribution clause without inventing a new claim.
  const clause = sentence.match(/^(.{40,}?)[,;]/)?.[1] ?? sentence;
  const summary = clause.length > 180
    ? clause.slice(0, clause.lastIndexOf(" ", 180) > 0 ? clause.lastIndexOf(" ", 180) : 180).trimEnd() + "…"
    : clause;
  return { summary, details };
}
