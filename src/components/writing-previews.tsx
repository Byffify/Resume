import type { Entry } from "@/lib/content";

function excerpt(body: string) {
  const text = body
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!?\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#*`>_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 220 ? `${text.slice(0, 220).trimEnd()}…` : text;
}

export function WritingPreviews({
  entries,
  author,
}: {
  entries: Entry[];
  author: string;
}) {
  return (
    <div className="writing-previews">
      {entries.map((entry) => (
        <article className="writing-preview" key={entry.id}>
          <div className="author">
            <span className="avatar-letter" aria-hidden="true">
              {author.charAt(0)}
            </span>
            <strong>{author}</strong>
          </div>
          <h2>
            <a href={`/${entry.kind}/${entry.id}`}>{entry.title}</a>
          </h2>
          <p>{excerpt(entry.body)}</p>
        </article>
      ))}
    </div>
  );
}
