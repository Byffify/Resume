import { defaultProfile, type Entry, type Profile } from "./content";
import { requireSupabase } from "./supabase";
import { entrySchema, profileSchema } from "./validation";
import type { PageData } from "../App";

type Target = { path: string[]; q: Record<string, string | undefined> };
const pageSize = 20;

// Quote the PostgREST value and escape LIKE metacharacters: search is literal.
export function searchPattern(query: string) {
  return `"%${query.replace(/[\\%_"]/g, (character) => "\\" + character)}%"`;
}

export async function loadPublicWriting(
  client: ReturnType<typeof requireSupabase>, signal: AbortSignal, target: Target,
): Promise<Pick<PageData, "entries" | "listing" | "writingUnavailable">> {
  const [route = "", id] = target.path;
  const published = (columns = "*") => client.from("entries")
    .select(columns, { count: "exact" }).eq("status", "published");
  const latest = (query: ReturnType<typeof published>) => query
    .order("published", { ascending: false }).order("id", { ascending: false });
  if (!route) {
    const results = await Promise.all((["notes", "archive"] as const).map((kind) =>
      latest(published("id,kind,title,tags,status,created,updated,published"))
        .eq("kind", kind).limit(3).abortSignal(signal),
    ));
    return {
      entries: results.flatMap((result) => result.error ? [] : (result.data as unknown as Omit<Entry, "body">[] ?? []).map((entry) => ({ ...entry, body: "" }))),
      writingUnavailable: results.some((result) => !!result.error),
    };
  }
  if (!["notes", "archive"].includes(route)) return { entries: [] };
  if (id) {
    if (!/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(id)) return { entries: [] };
    const result = await published().eq("kind", route).eq("id", id).abortSignal(signal);
    if (result.error) throw result.error;
    return { entries: (result.data ?? []) as unknown as Entry[] };
  }
  const requested = Number(target.q.page || 1);
  let page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, 100000) : 1;
  const fetchPage = (number: number) => {
    let query = latest(published()).eq("kind", route);
    if (target.q.q) {
      const pattern = searchPattern(target.q.q);
      query = query.or(`title.ilike.${pattern},body.ilike.${pattern}`);
    }
    if (target.q.tag) query = query.contains("tags", [target.q.tag]);
    return query.range((number - 1) * pageSize, number * pageSize - 1).abortSignal(signal);
  };
  let result = await fetchPage(page);
  if (result.error) throw result.error;
  const total = result.count ?? 0;
  const lastPage = Math.max(1, Math.ceil(total / pageSize));
  if (page > lastPage) {
    page = lastPage;
    result = await fetchPage(page);
    if (result.error) throw result.error;
  }
  const tags = new Set<string>();
  // Fetch only tag metadata, in batches, so filters also cover later pages.
  if (route === "notes") {
    let offset = 0;
    while (true) {
      const batch = await published("tags").eq("kind", route).order("id")
        .range(offset, offset + 999).abortSignal(signal);
      if (batch.error) throw batch.error;
      for (const entry of (batch.data ?? []) as unknown as Pick<Entry, "tags">[]) for (const tag of entry.tags ?? []) tags.add(tag);
      offset += batch.data?.length ?? 0;
      if (!batch.data?.length || offset >= (batch.count ?? offset)) break;
    }
  }
  return { entries: (result.data ?? []) as unknown as Entry[], listing: { total, page, pageSize, tags: [...tags].sort() } };
}

export async function loadContent(admin: boolean, signal: AbortSignal, target: Target = { path: [], q: {} }): Promise<PageData> {
  const client = requireSupabase();
  let owner = false;
  if (admin) {
    const { data, error } = await client
      .rpc("is_site_owner")
      .abortSignal(signal);
    if (error) throw error;
    owner = data === true;
  }
  const [profileResult, writing] = await Promise.all([
    client
      .from("site_profile")
      .select("data")
      .eq("id", 1)
      .abortSignal(signal)
      .maybeSingle(),
    admin ? (owner ? client.from("entries").select("*")
      .order("updated", { ascending: false }).order("id", { ascending: false })
      .abortSignal(signal).then((result) => {
        if (result.error) throw result.error;
        return { entries: (result.data ?? []) as Entry[] };
      }) : Promise.resolve({ entries: [] })) : loadPublicWriting(client, signal, target),
  ]);
  if (profileResult.error) throw profileResult.error;
  return {
    profile: profileResult.data
      ? (profileSchema.parse(profileResult.data.data) as Profile)
      : defaultProfile,
    ...writing,
    owner,
  };
}

export async function saveContent(input: unknown): Promise<{ entry?: Entry }> {
  const client = requireSupabase();
  const data = input as Record<string, unknown>;
  if (data.action === "profile") {
    const profile = profileSchema.parse(data.profile);
    const { error } = await client
      .from("site_profile")
      .upsert({ id: 1, data: profile })
      .select("id")
      .single();
    if (error)
      throw new Error("Could not save. Check your owner access and connection.");
    return {};
  }
  const { id, ...entry } = entrySchema.parse(input);
  entry.tags = [...new Set(entry.tags)];
  const query = id
    ? client.from("entries").update(entry).eq("id", id)
    : client.from("entries").insert(entry);
  const { data: saved, error } = await query.select("*").single();
  if (error)
    throw new Error(
      "Could not save. Check your owner access and content. Your changes are still in the form.",
    );
  return { entry: saved as Entry };
}
