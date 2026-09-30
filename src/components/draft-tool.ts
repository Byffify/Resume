import { useEffect, useRef } from "react";
import { z } from "zod";
const draftSchema = z
  .object({
    kind: z.enum(["notes", "archive"]),
    title: z.string().trim().min(1).max(200),
    body: z.string().max(100000),
    tags: z.array(z.string().trim().min(1).max(60)).max(30),
  })
  .strict();
type Staged = z.infer<typeof draftSchema>;
export function useDraftTool(stage: (input: Staged) => void) {
  const action = useRef(stage);
  action.current = stage;
  useEffect(() => {
    const ctx = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: unknown,
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!ctx) return;
    const lifecycle = new AbortController();
    try {
      void Promise.resolve(
        ctx.registerTool(
          {
            name: "stage_writing_draft",
            title: "Prepare a writing draft",
            description:
              "Stage a new Note or Archive post in the owner editor for review. Does not save or publish. Rejects if the current draft has unsaved edits.",
            inputSchema: {
              type: "object",
              properties: {
                kind: { type: "string", enum: ["notes", "archive"] },
                title: { type: "string", minLength: 1, maxLength: 200 },
                body: { type: "string", maxLength: 100000 },
                tags: {
                  type: "array",
                  items: { type: "string", minLength: 1, maxLength: 60 },
                  maxItems: 30,
                },
              },
              required: ["kind", "title", "body", "tags"],
              additionalProperties: false,
            },
            annotations: { readOnlyHint: false, untrustedContentHint: true },
            async execute(input: unknown) {
              const value = draftSchema.parse(input);
              action.current(value);
              await new Promise<void>((resolve) =>
                requestAnimationFrame(() => resolve()),
              );
              return {
                staged: true,
                saved: false,
                published: false,
                title: value.title,
              };
            },
          },
          { signal: lifecycle.signal },
        ),
      ).catch((e) => console.warn("Draft tool unavailable", e));
    } catch (e) {
      console.warn("Draft tool unavailable", e);
    }
    return () => lifecycle.abort();
  }, []);
}
