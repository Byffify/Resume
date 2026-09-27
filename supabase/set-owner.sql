-- Run AFTER schema.sql in the Supabase SQL Editor (not from the browser).
-- Create the owner account in Authentication > Users first.
-- Replace the text below with that user's UUID. An invalid UUID fails safely.
insert into private.site_owner (id, user_id)
values (1, 'REPLACE_WITH_OWNER_USER_ID'::uuid)
on conflict (id) do update set user_id = excluded.user_id;
