import { Profile } from "@/lib/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { bulletEdit } from "@/lib/bullet-list";
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
            <p className="muted">Information shown on your About and Resume pages</p>
            {field("name", "Display name")}
            {field("intro", "Short introduction")}
            {field("about", "About you", true)}
            {field("experience", "Experience (supports Markdown)", true)}
            {field("skills", "Skills", true)}
            {field(
              "interests",
              "Interests (comma-separated; use the same names as your Notes tags)",
            )}
            <h2>Get in touch</h2>
            {p.contacts.map((c, i) => (
              <div className="repeat-row" key={i}>
                <label>
                  Contact name
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
                  URL, www. or mailto:
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
                  Remove
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
              + Add contact
            </Button>
            <h2>Achievements &amp; Certificates</h2>
            <p className="muted">Shown on your Resume page</p>
            {p.achievements.map((achievement, i) => (
              <div className="project-edit" key={i}>
                <label className="field">
                  Title
                  <Input
                    value={achievement.title}
                    maxLength={200}
                    onChange={(e) =>
                      onChange({
                        ...p,
                        achievements: p.achievements.map((x, j) =>
                          i === j ? { ...x, title: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </label>
                <label className="field">
                  Issuer or year
                  <Input
                    value={achievement.detail}
                    maxLength={500}
                    onChange={(e) =>
                      onChange({
                        ...p,
                        achievements: p.achievements.map((x, j) =>
                          i === j ? { ...x, detail: e.target.value } : x,
                        ),
                      })
                    }
                  />
                </label>
                <label className="field">
                  Certificate URL (optional)
                  <Input
                    value={achievement.url}
                    maxLength={2000}
                    onChange={(e) =>
                      onChange({
                        ...p,
                        achievements: p.achievements.map((x, j) =>
                          i === j ? { ...x, url: e.target.value } : x,
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
                      achievements: p.achievements.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove achievement
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                onChange({
                  ...p,
                  achievements: [
                    ...p.achievements,
                    { title: "", detail: "", url: "" },
                  ],
                })
              }
            >
              + Add achievement
            </Button>
          </>
        ) : (
          <>
            <h1>Selected projects.</h1>
            <p className="muted">Projects you’d like to share</p>
            {p.projects.map((project, i) => (
              <div className="project-edit" key={i}>
                {(
                  [
                    ["name", "Project name"],
                    ["description", "Description"],
                    ["role", "Tech Stack"],
                    ["url", "Project URL"],
                  ] as const
                ).map(([k, label]) => (
                  <label className="field" key={k}>
                    {label}
                    <Textarea
                      rows={k === "description" ? 3 : 1}
                      value={project[k]}
                      onKeyDown={(e) => {
                        if (k !== "description" || e.nativeEvent.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
                        const target = e.currentTarget;
                        const edit = bulletEdit(target.value, target.selectionStart, target.selectionEnd, e.key);
                        if (!edit) return;
                        e.preventDefault();
                        onChange({
                          ...p,
                          projects: p.projects.map((x, j) =>
                            i === j ? { ...x, description: edit.value } : x,
                          ),
                        });
                        requestAnimationFrame(() => target.setSelectionRange(edit.caret, edit.caret));
                      }}
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
                  Remove project
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
              + Add project
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
