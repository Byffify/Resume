import { Profile } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
export function ProfileForm({
  profile: p,
  onChange,
  save,
  busy,
  view,
}: {
  profile: Profile;
  onChange: (p: Profile) => void;
  save: () => void;
  busy: boolean;
  view: "profile" | "projects";
}) {
  const field = (
    key: "name" | "intro" | "about" | "experience" | "skills" | "interests",
    label: string,
    multi = false,
  ) => (
    <label className="field">
      {label}
      {multi ? (
        <Textarea
          value={p[key]}
          onChange={(e) => onChange({ ...p, [key]: e.target.value })}
          rows={5}
        />
      ) : (
        <Input
          value={p[key]}
          onChange={(e) => onChange({ ...p, [key]: e.target.value })}
        />
      )}
    </label>
  );
  return (
    <form
      className="profile-form"
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
    >
      <fieldset disabled={busy}>
        {view === "profile" ? (
          <>
            <h1>Tell your story.</h1>
            <p className="muted">ข้อมูลที่จะแสดงใน About และ Resume</p>
            {field("name", "ชื่อที่แสดง")}
            {field("intro", "แนะนำตัวสั้น ๆ")}
            {field("about", "เกี่ยวกับคุณ", true)}
            {field("experience", "ประสบการณ์ (รองรับ Markdown)", true)}
            {field("skills", "ทักษะ", true)}
            {field(
              "interests",
              "หัวข้อความสนใจ (คั่นด้วย , และใช้ชื่อเดียวกับแท็ก Notes)",
            )}
            <h2>Get in touch</h2>
            {p.contacts.map((c, i) => (
              <div className="repeat-row" key={i}>
                <label>
                  ชื่อช่องทาง
                  <Input
                    value={c.label}
                    onChange={(e) =>
                      onChange({
                        ...p,
                        contacts: p.contacts.map((x, j) =>
                          j === i ? { ...x, label: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  URL, www. หรือ mailto:
                  <Input
                    value={c.url}
                    onChange={(e) =>
                      onChange({
                        ...p,
                        contacts: p.contacts.map((x, j) =>
                          j === i ? { ...x, url: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    onChange({
                      ...p,
                      contacts: p.contacts.filter((_, j) => j !== i),
                    })
                  }
                >
                  นำออก
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onChange({
                  ...p,
                  contacts: [...p.contacts, { label: "", url: "" }],
                })
              }
            >
              + เพิ่มช่องทาง
            </Button>
          </>
        ) : (
          <>
            <h1>Selected projects.</h1>
            <p className="muted">ผลงานที่คุณอยากเล่าให้คนอื่นรู้จัก</p>
            {p.projects.map((project, i) => (
              <div className="project-edit" key={i}>
                {(
                  [
                    ["name", "ชื่อผลงาน"],
                    ["description", "คำอธิบาย"],
                    ["role", "Tech Stack"],
                    ["url", "ลิงก์ผลงาน"],
                  ] as const
                ).map(([k, label]) => (
                  <label className="field" key={k}>
                    {label}
                    <Textarea
                      rows={k === "description" ? 3 : 1}
                      value={project[k]}
                      onChange={(e) =>
                        onChange({
                          ...p,
                          projects: p.projects.map((x, j) =>
                            i === j ? { ...x, [k]: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </label>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    onChange({
                      ...p,
                      projects: p.projects.filter((_, j) => j !== i),
                    })
                  }
                >
                  นำผลงานออก
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onChange({
                  ...p,
                  projects: [
                    ...p.projects,
                    { name: "", description: "", role: "", url: "" },
                  ],
                })
              }
            >
              + เพิ่มผลงาน
            </Button>
          </>
        )}
        <div className="editor-actions">
          <Button type="submit" disabled={busy || !p.name.trim()}>
            {busy ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
