// Adapted from Watermelon UI Blog 2. See WATERMELON-LICENSE.txt.
import { ArrowUpRight } from "lucide-react";
export type Resource = {
  title: string;
  description: string;
  href: string;
  meta?: string;
};
export function ResourceCards({ items }: { items: Resource[] }) {
  return (
    <div className="resource-grid">
      {items.map((item) => (
        <a
          key={item.href}
          className="resource-card"
          aria-label={item.title}
          href={item.href}
        >
          <article>
            {item.meta && <span className="card-meta">{item.meta}</span>}
            <h3>
              {item.title}
              <ArrowUpRight size={15} aria-hidden="true" />
            </h3>
            <p>{item.description}</p>
          </article>
        </a>
      ))}
    </div>
  );
}
