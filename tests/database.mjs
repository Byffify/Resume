import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const db = new PGlite();
const owner = "11111111-1111-4111-8111-111111111111";
const stranger = "22222222-2222-4222-8222-222222222222";
async function as(role, id = "") {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [id]);
  await db.exec(`set role ${role}`);
}
try {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema public, auth to anon, authenticated;
    grant execute on function auth.uid() to anon, authenticated;
  `);
  const schema = await readFile(
    new URL("../supabase/schema.sql", import.meta.url),
    "utf8",
  );
  // Exercise the upgrade against the legacy Blog constraint and trigger.
  await db.exec(schema.replace("kind in ('notes', 'archive')", "kind in ('notes', 'blog')"));
  await db.exec("alter table entries disable trigger prepare_entry");
  const legacy = (await db.query(
    "insert into entries(kind,title,body,tags,status,created,published,updated) values ('blog','Weekly AI','Original body',array['AI'],'published','2025-01-01','2025-01-02','2025-01-03'), ('blog','Private weekly','Draft body',array['Tech'],'draft','2025-02-01',null,'2025-02-03'), ('notes','Keep note','Note body','{}','draft','2025-03-01',null,'2025-03-02') returning *"
  )).rows;
  await db.exec("alter table entries enable trigger prepare_entry");
  const migration = await readFile(new URL("../supabase/migrate-blog-to-archive.sql", import.meta.url), "utf8");
  await db.exec(migration);
  await db.exec(migration);
  for (const original of legacy) {
    const migrated = (await db.query("select * from entries where id=$1", [original.id])).rows[0];
    assert.deepEqual(migrated, {...original, kind: original.kind === "blog" ? "archive" : "notes"});
  }
  await as("anon");
  assert.equal((await db.query("select * from entries")).rows.length, 1);
  await as("postgres");
  await assert.rejects(db.query("update entries set kind='notes' where id=$1", [legacy[0].id]));
  await assert.rejects(db.query("insert into entries(kind,title) values ('blog','Removed')"));
  await db.exec("delete from entries");
  await db.exec(schema);
  await db.exec(schema); // Setup must be safe to rerun.
  await db.query("insert into auth.users(id) values ($1), ($2)", [
    owner,
    stranger,
  ]);
  await as("authenticated", stranger);
  assert.equal(
    (await db.query("select public.is_site_owner() as allowed")).rows[0]
      .allowed,
    false,
  );
  await assert.rejects(
    db.query("insert into entries(kind,title) values ('notes','Not owner')"),
  );
  await as("postgres");
  const setOwner = (
    await readFile(
      new URL("../supabase/set-owner.sql", import.meta.url),
      "utf8",
    )
  ).replace("REPLACE_WITH_OWNER_USER_ID", owner);
  await db.exec(setOwner);
  await as("authenticated", owner);
  assert.equal(
    (await db.query("select public.is_site_owner() as allowed")).rows[0]
      .allowed,
    true,
  );
  const draft = (
    await db.query(
      "insert into entries(kind,title,body,tags) values ('notes',' Draft ','searchable body',array['QA']) returning *",
    )
  ).rows[0];
  assert.equal(draft.title, "Draft");
  assert.equal(draft.published, null);
  await assert.rejects(
    db.query("insert into entries(kind,title) values ('notes','  ')"),
  );
  await assert.rejects(
    db.query(
      "insert into entries(kind,title,tags) values ('notes','Bad tag',array[''])",
    ),
  );
  await assert.rejects(
    db.query("update entries set kind = 'archive' where id = $1", [draft.id]),
  );
  await assert.rejects(
    db.query("update entries set id = $1 where id = $2", [stranger, draft.id]),
  );
  await assert.rejects(db.query("update site_profile set data = '{}'::jsonb"));
  await db.query(
    "update site_profile set data = jsonb_set(data, '{name}', '\"Owner\"'::jsonb) where id = 1",
  );
  for (const [role, id] of [
    ["anon", ""],
    ["authenticated", stranger],
  ]) {
    await as(role, id);
    assert.equal((await db.query("select * from entries")).rows.length, 0);
    assert.equal(
      (await db.query("select * from site_profile")).rows[0].data.name,
      "Owner",
    );
    await assert.rejects(db.query("select * from private.site_owner"));
    await assert.rejects(
      db.query("insert into private.site_owner(id,user_id) values (1,$1)", [
        stranger,
      ]),
    );
    await assert.rejects(
      db.query(
        "insert into entries(kind,title,status) values ('notes','Attack','published')",
      ),
    );
  }
  await as("authenticated", owner);
  const published = (
    await db.query(
      "update entries set status='published' where id=$1 returning *",
      [draft.id],
    )
  ).rows[0];
  assert.ok(published.published);
  for (const [role, id] of [
    ["anon", ""],
    ["authenticated", stranger],
  ]) {
    await as(role, id);
    assert.equal((await db.query("select * from entries")).rows.length, 1);
    if (role === "authenticated") {
      assert.equal(
        (await db.query("update entries set title='Attack' returning id")).rows
          .length,
        0,
      );
      assert.equal(
        (await db.query("delete from entries returning id")).rows.length,
        0,
      );
      assert.equal(
        (
          await db.query(
            "update site_profile set data=jsonb_set(data,'{name}','\"Attack\"') returning id",
          )
        ).rows.length,
        0,
      );
    } else {
      await assert.rejects(db.query("update entries set title='Attack'"));
      await assert.rejects(db.query("delete from entries"));
    }
  }
  await as("authenticated", owner);
  const updated = (
    await db.query(
      "update entries set title='Updated', created='2000-01-01', published='2000-01-01' where id=$1 returning *",
      [draft.id],
    )
  ).rows[0];
  assert.deepEqual(updated.created, draft.created);
  assert.deepEqual(updated.published, published.published);
  await db.query("update entries set status='draft' where id=$1", [draft.id]);
  await as("anon");
  assert.equal((await db.query("select * from entries")).rows.length, 0);
  await as("authenticated", owner);
  const republished = (
    await db.query(
      "update entries set status='published' where id=$1 returning *",
      [draft.id],
    )
  ).rows[0];
  assert.deepEqual(republished.published, published.published);
  await as("postgres");
  await db.exec(schema);
  assert.equal((await db.query("select * from entries")).rows.length, 1);
  assert.equal(
    (await db.query("select * from site_profile")).rows[0].data.name,
    "Owner",
  );
  console.log(
    "PASS: repeatable setup; no owner by default; owner-only writes; anonymous/non-owner draft privacy; immutable ID/kind/dates; validation; publish/unpublish; private owner record.",
  );
} finally {
  await db.close();
}
