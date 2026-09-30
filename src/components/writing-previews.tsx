import type { Entry } from "@/lib/content";
import { Author } from "./site";
import { plainText } from "@/lib/writing";

function excerpt(body: string) {
  const text = plainText(body);
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
          <Author name={author} body={entry.body} published={entry.published} />
          <h2>
            <a href={`/${entry.kind}/${entry.id}`}>{entry.title}</a>
          </h2>
          <p>{excerpt(entry.body)}</p>
        </article>
      ))}
    </div>
  );
}
