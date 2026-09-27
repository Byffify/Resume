export type Entry = {
  id: string;
  kind: "notes" | "blog";
  title: string;
  body: string;
  tags: string[];
  status: "draft" | "published";
  created: string;
  published: string | null;
  updated: string;
};
export type Profile = {
  name: string;
  intro: string;
  about: string;
  experience: string;
  skills: string;
  interests: string;
  contacts: { label: string; url: string }[];
  projects: { name: string; description: string; role: string; url: string }[];
};
export const defaultProfile: Profile = {
  name: "Borworn",
  intro: "พื้นที่เล็ก ๆ สำหรับเรื่องราว ความสนใจ และสิ่งที่ได้เรียนรู้",
  about:
    "ยินดีต้อนรับสู่พื้นที่ของผม — ที่รวมประวัติ ผลงาน และบันทึกระหว่างทาง",
  experience: "",
  skills: "",
  interests: "",
  contacts: [],
  projects: [],
};
export const date = (v: string | null) =>
  v
    ? new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Bangkok",
      }).format(new Date(v))
    : "ฉบับร่าง";
export function safeUrl(value: string, image = false) {
  try {
    const u = new URL(value);
    return (image
      ? ["https:", "http:"]
      : ["https:", "http:", "mailto:"]
    ).includes(u.protocol)
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}

export function contactUrl(value: string) {
  const trimmed = value.trim();
  return safeUrl(/^www\./i.test(trimmed) ? `https://${trimmed}` : trimmed);
}
