import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { createServer } from "vite";

const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  const { loadPublicWriting, searchPattern } = await vite.ssrLoadModule("/src/lib/store.ts");
  const requests = [];
  let responses = [];
  const client = createClient("https://example.supabase.co", "test-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: async (input) => {
      requests.push(new URL(String(input)));
      const { data = [], total = data.length, status = 200 } = responses.shift() ?? {};
      return new Response(JSON.stringify(data), {
        status, headers: { "content-type": "application/json", "content-range": `0-${Math.max(0, data.length - 1)}/${total}` },
      });
    } },
  });
  const load = async (path, q = {}, nextResponses = []) => {
    requests.length = 0;
    responses = nextResponses;
    return loadPublicWriting(client, new AbortController().signal, { path, q });
  };
  await load(["about"]);
  assert.equal(requests.length, 0, "About must not depend on writing requests");
  await load(["projects"]);
  assert.equal(requests.length, 0);
  const home = await load([], {}, [{ data: [{ id: "note", kind: "notes" }] }, { data: [] }]);
  assert.equal(home.entries[0].body, "");
  assert.equal(requests.length, 2);
  for (const request of requests) {
    assert.equal(request.searchParams.get("limit"), "3");
    assert.ok(!request.searchParams.get("select").split(",").includes("body"));
    assert.equal(request.searchParams.get("status"), "eq.published");
  }
  const degraded = await load([], {}, [{ data: { message: "Writing unavailable" }, status: 400 }, { data: [] }]);
  assert.equal(degraded.writingUnavailable, true);
  await load(["notes", "not-a-uuid"]);
  assert.equal(requests.length, 0);
  const id = "12345678-1234-1234-1234-123456789abc";
  await load(["notes", id]);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].searchParams.get("id"), `eq.${id}`);
  assert.equal(requests[0].searchParams.get("kind"), "eq.notes");
  const listing = await load(["notes"], { page: "2", q: 'a%,"b', tag: "Writing" }, [
    { data: [], total: 25 }, { data: [{ tags: ["Writing", "Later"] }], total: 1 },
  ]);
  assert.equal(requests[0].searchParams.get("offset"), "20");
  assert.equal(requests[0].searchParams.get("limit"), "20");
  assert.equal(requests[0].searchParams.get("or"), `(title.ilike.${searchPattern('a%,"b')},body.ilike.${searchPattern('a%,"b')})`);
  assert.equal(requests[1].searchParams.get("select"), "tags");
  assert.equal(requests[1].searchParams.has("or"), false, "Available tags must not depend on current search");
  assert.deepEqual(listing.listing.tags, ["Later", "Writing"]);
  assert.equal(listing.listing.total, 25);
  const clamped = await load(["archive"], { page: "99" }, [{ data: [], total: 21 }, { data: [], total: 21 }]);
  assert.equal(clamped.listing.page, 2);
  assert.equal(requests[1].searchParams.get("offset"), "20");
  console.log("PASS: route-specific published queries, bounded home/list payloads, literal search encoding, independent tags, page bounds, and home recovery.");
} finally {
  await vite.close();
}
