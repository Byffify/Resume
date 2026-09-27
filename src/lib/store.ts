import { defaultProfile, type Entry, type Profile } from "./content";
import { requireSupabase } from "./supabase";
import { entrySchema, profileSchema } from "./validation";

export async function loadContent(admin: boolean, signal: AbortSignal) {
  const client = requireSupabase();
  let owner = false;
  if (admin) {
    const { data, error } = await client
      .rpc("is_site_owner")
      .abortSignal(signal);
    if (error) throw error;
    owner = data === true;
  }
  let query = client.from("entries").select("*");
  if (!owner) query = query.eq("status", "published");
  const [profileResult, entriesResult] = await Promise.all([
    client
      .from("site_profile")
      .select("data")
      .eq("id", 1)
      .abortSignal(signal)
      .maybeSingle(),
    query
      .order(owner ? "updated" : "published", { ascending: false })
      .order("id", { ascending: false })
      .abortSignal(signal),
  ]);
  if (profileResult.error) throw profileResult.error;
  if (entriesResult.error) throw entriesResult.error;
  return {
    profile: profileResult.data
      ? (profileSchema.parse(profileResult.data.data) as Profile)
      : defaultProfile,
    entries: entriesResult.data as Entry[],
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
