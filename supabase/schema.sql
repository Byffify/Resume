-- Run in Supabase SQL Editor. Safe to rerun; existing content is preserved.
begin;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
create table if not exists private.site_owner (
  id integer primary key default 1 check (id = 1),
  user_id uuid not null unique references auth.users(id) on delete cascade
);
alter table private.site_owner enable row level security;
revoke all on private.site_owner from public, anon, authenticated;

create or replace function public.is_site_owner()
returns boolean language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from private.site_owner where id = 1 and user_id = (select auth.uid())
  );
$$;
revoke all on function public.is_site_owner() from public;
grant execute on function public.is_site_owner() to anon, authenticated;

create or replace function public.valid_site_profile(value jsonb)
returns boolean language plpgsql immutable set search_path = ''
as $$
declare field text; item jsonb;
begin
  if value is null or jsonb_typeof(value) <> 'object' then return false; end if;
  foreach field in array array['name','intro','about','experience','skills','interests'] loop
    if jsonb_typeof(value -> field) is distinct from 'string' then return false; end if;
  end loop;
  if char_length(btrim(value->>'name')) not between 1 and 100
    or char_length(value->>'intro') > 1000
    or char_length(value->>'about') > 30000
    or char_length(value->>'experience') > 30000
    or char_length(value->>'skills') > 5000
    or char_length(value->>'interests') > 2000 then return false; end if;
  if jsonb_typeof(value->'contacts') is distinct from 'array'
    or jsonb_typeof(value->'projects') is distinct from 'array' then return false; end if;
  if jsonb_array_length(value->'contacts') > 20 or jsonb_array_length(value->'projects') > 100 then return false; end if;
  for item in select * from jsonb_array_elements(value->'contacts') loop
    if jsonb_typeof(item->'label') is distinct from 'string'
      or jsonb_typeof(item->'url') is distinct from 'string'
      or char_length(item->>'label') > 100 or char_length(item->>'url') > 2000 then return false; end if;
  end loop;
  for item in select * from jsonb_array_elements(value->'projects') loop
    foreach field in array array['name','description','role','url'] loop
      if jsonb_typeof(item->field) is distinct from 'string' then return false; end if;
    end loop;
    if char_length(item->>'name') > 200 or char_length(item->>'description') > 5000
      or char_length(item->>'role') > 500 or char_length(item->>'url') > 2000 then return false; end if;
  end loop;
  return true;
end;
$$;
revoke all on function public.valid_site_profile(jsonb) from public;
grant execute on function public.valid_site_profile(jsonb) to authenticated;

create table if not exists public.site_profile (
  id integer primary key default 1 check (id = 1),
  data jsonb not null check (public.valid_site_profile(data))
);
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('notes', 'blog')),
  title text not null check (char_length(btrim(title)) between 1 and 200),
  body text not null default '' check (char_length(body) <= 100000),
  tags text[] not null default '{}' check (cardinality(tags) <= 30),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created timestamptz not null default now(),
  published timestamptz,
  updated timestamptz not null default now()
);
create index if not exists entries_public_order on public.entries(status, kind, published desc);

create or replace function public.prepare_entry()
returns trigger language plpgsql set search_path = '' as $$
declare tag text;
begin
  if tg_op = 'UPDATE' then
    if new.id <> old.id or new.kind <> old.kind then
      raise exception 'Entry ID and kind cannot be changed';
    end if;
    new.created := old.created;
    new.published := old.published;
  else
    new.created := now();
    new.published := null;
  end if;
  new.title := btrim(new.title);
  if new.tags is null then raise exception 'Tags are required'; end if;
  foreach tag in array new.tags loop
    if tag is null or char_length(btrim(tag)) not between 1 and 60 then
      raise exception 'Invalid tag';
    end if;
  end loop;
  new.updated := now();
  if new.status = 'published' and new.published is null then new.published := now(); end if;
  return new;
end;
$$;
revoke all on function public.prepare_entry() from public, anon, authenticated;
drop trigger if exists prepare_entry on public.entries;
create trigger prepare_entry before insert or update on public.entries
for each row execute function public.prepare_entry();

alter table public.site_profile enable row level security;
alter table public.entries enable row level security;
revoke all on public.site_profile, public.entries from anon, authenticated;
grant select on public.site_profile, public.entries to anon, authenticated;
grant insert, update on public.site_profile to authenticated;
grant insert, update, delete on public.entries to authenticated;

drop policy if exists profile_read on public.site_profile;
create policy profile_read on public.site_profile for select to anon, authenticated using (true);
drop policy if exists profile_insert on public.site_profile;
create policy profile_insert on public.site_profile for insert to authenticated with check ((select public.is_site_owner()));
drop policy if exists profile_update on public.site_profile;
create policy profile_update on public.site_profile for update to authenticated using ((select public.is_site_owner())) with check ((select public.is_site_owner()));

drop policy if exists entries_read on public.entries;
create policy entries_read on public.entries for select to anon, authenticated using (status = 'published' or (select public.is_site_owner()));
drop policy if exists entries_insert on public.entries;
create policy entries_insert on public.entries for insert to authenticated with check ((select public.is_site_owner()));
drop policy if exists entries_update on public.entries;
create policy entries_update on public.entries for update to authenticated using ((select public.is_site_owner())) with check ((select public.is_site_owner()));
drop policy if exists entries_delete on public.entries;
create policy entries_delete on public.entries for delete to authenticated using ((select public.is_site_owner()));

insert into public.site_profile(id, data) values (1, '{"name":"Borworn","intro":"A small space for stories, interests, and things I have learned.","about":"Welcome to my space for my background, projects, and notes along the way.","experience":"","skills":"","interests":"","contacts":[],"projects":[]}'::jsonb)
on conflict (id) do nothing;
commit;
