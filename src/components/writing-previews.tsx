import type { Entry } from "@/lib/content";
import { date } from "@/lib/content";
import { plainText, readingMinutes } from "@/lib/writing";

function excerpt(body: string) {
  const text = plainText(body);
  return text.length > 220 ? `${text.slice(0, 220).trimEnd()}…` : text;
}

export function WritingPreviews({
  entries,
  author,
  headingLevel = 2,
}: {
  entries: Entry[];
  author: string;
  headingLevel?: 2 | 3;
}) {
  const Heading = headingLevel === 3 ? "h3" : "h2";
  return (
    <div className="writing-previews">
      {entries.map((entry) => (
        <article className="writing-preview" key={entry.id}>
          <div className="preview-meta">
            <span>{author}</span>
            <span>{entry.published ? <time dateTime={entry.published}>{date(entry.published)}</time> : "Draft"} · {readingMinutes(entry.body)} min read</span>
          </div>
          <Heading>
            <a href={`/${entry.kind}/${entry.id}`}>{entry.title}</a>
          </Heading>
          <p>{excerpt(entry.body)}</p>
        </article>
      ))}
    </div>
  );
}
