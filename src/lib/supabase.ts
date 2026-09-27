import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Leave the app renderable before configuration; never simulate owner access.
export const supabase = url && key ? createClient(url, key) : null;

export function requireSupabase() {
  if (!supabase)
    throw new Error("Set up Supabase in .env.local before using the website.");
  return supabase;
}

export async function signOut() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
  window.location.assign("/");
}
