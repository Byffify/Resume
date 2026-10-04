import React from "react";
import { safeUrl } from "@/lib/content";
function inline(s: string): React.ReactNode[] {
  return s
    .split(/(!?\[[^\]]*\]\([^\s)]+\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g)
    .map((v, i) => {
      const m = v.match(/^(!?)\[([^\]]*)\]\(([^\s)]+)\)$/);
      if (m) {
        const url = safeUrl(m[3], !!m[1]);
        if (!url) return m[2];
        return m[1] ? (
          <img key={i} src={url} alt={m[2]} loading="lazy" />
        ) : (
          <a key={i} href={url} rel="noopener noreferrer">
            {m[2].trim() || url}
          </a>
        );
      }
      if (v.startsWith("`") && v.endsWith("`"))
        return <code key={i}>{v.slice(1, -1)}</code>;
      if (v.startsWith("**")) return <strong key={i}>{v.slice(2, -2)}</strong>;
      if (v.startsWith("*") && v.endsWith("*"))
        return <em key={i}>{v.slice(1, -1)}</em>;
      return v;
    });
}
export function Markdown({ body }: { body: string }) {
  const lines = body.replace(/\r/g, "").split("\n");
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith("```")) {
      const lang = l.slice(3);
      const code = [];
      while (++i < lines.length && !lines[i].startsWith("```"))
        code.push(lines[i]);
      blocks.push(
        <figure className="code" key={i}>
          {lang && <figcaption>{lang}</figcaption>}
          <pre>
            <code>{code.join("\n")}</code>
          </pre>
        </figure>,
      );
    } else if (/^#{1,3} /.test(l)) {
      const n = l.indexOf(" ");
      blocks.push(
        React.createElement(
          "h" + Math.min(n + 1, 4),
          { key: i },
          inline(l.slice(n + 1)),
        ),
      );
    } else if (l.startsWith("- ")) {
      const items = [l.slice(2)];
      while (i + 1 < lines.length && lines[i + 1].startsWith("- "))
        items.push(lines[++i].slice(2));
      blocks.push(
        <ul key={i}>
          {items.map((x, j) => (
            <li key={j}>{inline(x)}</li>
          ))}
        </ul>,
      );
    } else if (l.startsWith("> "))
      blocks.push(<blockquote key={i}>{inline(l.slice(2))}</blockquote>);
    else if (l.trim()) blocks.push(<p key={i}>{inline(l)}</p>);
  }
  return <div className="prose">{blocks}</div>;
}
