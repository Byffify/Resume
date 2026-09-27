import { z } from "zod";
export const entrySchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(["notes", "blog"]),
  title: z.string().trim().min(1).max(200),
  body: z.string().max(100000),
  tags: z.array(z.string().trim().min(1).max(60)).max(30),
  status: z.enum(["draft", "published"]),
});
export const profileSchema = z.object({
  name: z.string().trim().min(1).max(100),
  intro: z.string().max(1000),
  about: z.string().max(30000),
  experience: z.string().max(30000),
  skills: z.string().max(5000),
  interests: z.string().max(2000),
  contacts: z
    .array(z.object({ label: z.string().max(100), url: z.string().max(2000) }))
    .max(20),
  projects: z
    .array(
      z.object({
        name: z.string().max(200),
        description: z.string().max(5000),
        role: z.string().max(500),
        url: z.string().max(2000),
      }),
    )
    .max(100),
});
