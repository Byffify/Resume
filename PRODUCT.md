# Borworn

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Borworn is the sole content owner. Public visitors can read the owner's background, projects, Notes, and Archive without an account.

Open decision: whether professional contacts and recruiters or readers of the writing are the primary audience. Their relative priority has not been confirmed.

## Product Purpose

A personal space for Borworn's background, projects, stories, interests, and things learned. It combines a professional profile with personal writing and a manually curated weekly AI/Tech Archive.

Public visitors should be able to find relevant background and writing and reach the owner's contact links. The owner should be able to maintain the profile and publish writing independently.

## Operating Context

- Public navigation contains About, Projects, Notes, and Archive. Resume content lives within About at `/about#resume`; contact information is linked at `/about#contact`.
- Notes hold personal writing. Archive is a separate publication kind for weekly AI/Tech summaries; the owner can specify the week in the title.
- The owner signs in at `/admin`, edits profile and projects, and creates, previews, edits, publishes, or unpublishes Markdown entries with tags.
- Public Notes support text search and tag filtering. Archive entries are grouped by publication month and year.
- Publication dates and Archive grouping use `Asia/Bangkok`. Reading-time calculation supports Thai and English, estimates 200 words per minute, and displays a minimum of one minute.

## Capabilities and Constraints

- The existing application uses Vite, React, TypeScript, and Supabase for data and owner authentication. Vercel is the documented deployment target; a current production deployment is not established by this record.
- Public visitors can read the profile, projects, and published entries. Only the designated owner can read drafts or modify content, enforced through database row-level security.
- Entries have separate `notes` and `archive` kinds and `draft` or `published` status. Entry IDs and kinds are immutable, and the first publication timestamp survives edits and unpublishing.
- Legacy `/blog` and `/blog/:id` links redirect to their Archive equivalents while retaining query strings and fragments. Existing databases require the documented Blog-to-Archive migration before deploying this frontend version.
- The application does not provide public registration or password reset. Owner account setup is managed through Supabase.
- Supabase connection configuration is required; missing configuration shows a setup screen rather than a simulated login.
- Preserve direct article URLs, private drafts, owner-only editing, and the distinction between Notes and Archive in future work.

## Brand Commitments

The product name is Borworn. Current introductory copy describes it as “A small space for stories, interests, and things I’ve learned.” Existing content uses a personal first-person voice.

Open decision: additional binding voice or brand requirements have not been specified. Visual direction is outside this product record.

## Evidence on Hand

- `README.md`: setup, owner permissions, deployment instructions, and Archive semantics.
- `src/lib/content.ts`: profile and entry models and fallback profile copy. Fallback experience, skills, projects, achievements, and contacts are empty; do not invent credentials or achievements.
- `src/pages/Content.tsx` and `src/components/site.tsx`: public routes and content presentation.
- `src/components/admin.tsx` and `src/components/profile-form.tsx`: owner writing and profile workflows.
- `public/images/Profile.jpg`: existing profile image used as author imagery.
- `public/images/notebook-collage.webp` and `public/favicon.svg`: existing visual assets.
- `supabase/schema.sql` and `supabase/migrate-blog-to-archive.sql`: data rules and compatibility migration.
- `tests/`: local database and UI checks. Their presence does not establish a passing run or verified production behavior.
- `WATERMELON-LICENSE.txt` and `vendor/`: licensing information for existing UI source.

## Product Principles

1. Keep professional background and personal writing available as distinct parts of one personal site; audience priority remains open.
2. Preserve the separate purpose of Notes and the weekly AI/Tech Archive.
3. Keep drafts private and content changes restricted to the designated owner.
4. Preserve content identity, direct links, and original publication dates across editing and migration.
5. Use real owner content and supplied evidence; leave missing profile details empty rather than inventing claims.

## Open Decisions

- Primary audience and the relative emphasis of professional information and writing.
- Any product-specific accessibility requirements beyond the existing implementation.
- Additional durable product constraints or differentiating claims beyond the repository evidence.

This record was created at the user's request from the existing code and documentation. Open decisions are intentionally unconfirmed.
