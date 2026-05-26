# Facilitation — Project Progress Tracker

A collaborative project management web app. Teams create projects, break them into sections, assign tasks with subtasks, track progress via charts, and communicate via project chat and DMs.

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Language | **TypeScript** | Supabase generates TS types from DB schema; type-safe end-to-end |
| Framework | **Next.js 15 (App Router)** | Server Components for reads, Server Actions for writes |
| Styling | **Tailwind CSS + shadcn/ui** | Dark-blue theme, copy-owned components |
| Charts | **Tremor** | Built on Recharts; ships dashboard-shaped primitives (KPI cards, donut charts, progress bars) |
| Database / Auth | **Supabase** | Postgres + RLS, Auth (email + OAuth), Realtime, Storage |
| Client state | **TanStack Query** | Caching for task lists and chat |
| Deployment | **Vercel** (frontend) + **Supabase** (backend) |
| Mobile | **PWA** via `next-pwa` — installable from Chrome on Android/iOS |
| Notifications | In-app (DB polling) + Web Push for PWA via Supabase Edge Functions |

## Project Structure

```
facilitation/
├── app/                        # Next.js App Router
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/              # All projects overview
│   ├── projects/
│   │   ├── new/
│   │   └── [id]/
│   │       ├── page.tsx        # Project overview (charts, % per section)
│   │       ├── board/          # Sections + tasks + subtasks
│   │       ├── calendar/       # Tasks by day/week
│   │       ├── chat/           # Project channel
│   │       ├── members/
│   │       └── settings/
│   └── dms/
│       └── [userId]/
├── components/
│   ├── ui/                     # shadcn/ui copies
│   ├── tasks/
│   ├── charts/
│   ├── chat/
│   └── layout/
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client (uses cookies)
│   │   └── types.ts            # Generated types (never edit manually)
│   ├── actions/                # Next.js Server Actions
│   └── utils/
├── supabase/
│   ├── migrations/             # SQL migration files
│   └── seed.sql
└── public/
    └── manifest.json           # PWA manifest
```

## Database Schema

All tables have RLS enabled. Never bypass RLS with the service role key on the client.

```sql
-- Auth handled by Supabase (auth.users)
profiles          (id, display_name, avatar_url, created_at)
projects          (id, name, description, type, owner_id, created_at)
                  -- type: 'individual' | 'paired' | 'specialisation'
project_members   (project_id, user_id, role, joined_at)
                  -- role: 'owner' | 'member'
project_invites   (id, project_id, code, email, created_by,
                   expires_at, max_uses, use_count)
sections          (id, project_id, name, order_index)
tasks             (id, section_id, parent_task_id, title, description,
                   assignee_id, status, due_date, completed_at, created_at)
                  -- parent_task_id NULL = top-level task; max 1 level deep
                  -- status: 'todo' | 'in_progress' | 'done'
task_attachments  (id, task_id, uploader_id, file_path, file_name,
                   file_size, mime_type, created_at)
comments          (id, task_id, user_id, body, created_at)
messages          (id, project_id, recipient_id, sender_id, body, created_at)
                  -- recipient_id NULL = project channel; set = DM
message_attachments (id, message_id, uploader_id, file_path, file_name,
                     file_size, mime_type, created_at)
notifications     (id, user_id, type, payload jsonb, read_at, created_at)
push_subscriptions (id, user_id, endpoint, keys jsonb, created_at)
```

### Progress Calculation (SQL views, not stored)

```sql
-- Section progress = completed tasks / total tasks (subtasks count separately)
-- Project progress = average of section progress values
-- Per-person progress = their completed assigned / their total assigned
```

## RLS Policy Pattern

Every table follows this pattern — a user can only touch rows where they are a project member:

```sql
-- Example for tasks:
create policy "members can read tasks"
  on tasks for select
  using (
    exists (
      select 1 from project_members pm
      join sections s on s.project_id = pm.project_id
      where s.id = tasks.section_id
        and pm.user_id = auth.uid()
    )
  );
```

Write policies are the same check. Owners additionally bypass member-only restrictions on sections and project settings.

## Security Rules (non-negotiable)

- **Passwords**: Supabase Auth handles bcrypt hashing — never touch raw passwords
- **API keys**: `SUPABASE_URL` and `SUPABASE_ANON_KEY` are safe for the browser. `SUPABASE_SERVICE_ROLE_KEY` is **server-only** — never import it in any file under `app/` that runs client-side
- **Invite codes**: generated with `nanoid(10)` — cryptographically random, never sequential
- **File uploads**: validate MIME type and file size in a Server Action before calling Supabase Storage. Serve private files via signed URLs only (never public bucket for attachments)
- **Queries**: Supabase SDK only — no raw string interpolation into SQL
- **RLS**: enabled on every table from day one, not added later

## Environment Variables

```bash
# .env.local (never commit this file)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-side only
NEXT_PUBLIC_APP_URL=              # e.g. http://localhost:3000
```

## Supabase Storage Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `task-attachments` | Private | Files on tasks |
| `message-attachments` | Private | Files in chat/DMs |
| `avatars` | Public | User profile pictures |

All private bucket files served via `createSignedUrl()` with short TTLs.

## Colour Scheme (Tailwind)

Dark blues + white, multiple shades. Extend in `tailwind.config.ts`:

```ts
colors: {
  brand: {
    950: '#0a0f1e',
    900: '#0d1526',
    800: '#112040',
    700: '#1a3160',
    600: '#1e4080',
    500: '#2563eb',  // primary action blue
    400: '#60a5fa',
    300: '#93c5fd',
    200: '#bfdbfe',
    100: '#dbeafe',
    50:  '#eff6ff',
  }
}
```

## Build Phases

### Phase 1 — Foundation
- [ ] Init Next.js 15 + Tailwind + shadcn/ui
- [ ] Supabase project setup, migrations for all tables, RLS policies
- [ ] Auth: login, register, OAuth (Google), session via Supabase SSR helpers
- [ ] Profiles

### Phase 2 — Projects & Tasks
- [ ] Create / list projects (dashboard)
- [ ] Invite by email + invite code flow
- [ ] Sections CRUD
- [ ] Tasks + subtasks CRUD, assignment, status toggle
- [ ] File attachments on tasks (Storage)

### Phase 3 — Dashboard & Charts
- [ ] Progress views (SQL views for % calculation)
- [ ] Tremor charts: section donut, per-person bar, project KPI cards
- [ ] Per-member checklist view

### Phase 4 — Calendar
- [ ] Calendar grid (monthly + weekly toggle)
- [ ] Click day → tasks completed that day
- [ ] Due-date highlighting

### Phase 5 — Chat
- [ ] Project channel (Supabase Realtime)
- [ ] DMs (same messages table, recipient_id set)
- [ ] File attachments in messages

### Phase 6 — Notifications & PWA
- [ ] In-app notification bell + unread count
- [ ] Web Push via Supabase Edge Function
- [ ] `next-pwa` manifest + service worker
- [ ] Mobile nav (bottom tab bar on small screens)

## Key Conventions

- **Server Actions** for all mutations — no API routes unless an external webhook needs one
- **Server Components** for initial data fetch; Client Components only where interactivity is needed
- **`lib/supabase/server.ts`** for server-side queries (uses `cookies()`), **`lib/supabase/client.ts`** for browser subscriptions (Realtime)
- Generated types in `lib/supabase/types.ts` — regenerate with `supabase gen types typescript --local > lib/supabase/types.ts` after every migration, never edit manually
- Migrations live in `supabase/migrations/` — always use `supabase migration new <name>`, never edit an already-applied migration
- shadcn/ui components are copied into `components/ui/` — modify them freely, they are yours

## Commands

```bash
# Dev
npm run dev

# Supabase local
npx supabase start
npx supabase migration new <name>
npx supabase db reset
npx supabase gen types typescript --local > lib/supabase/types.ts

# Deploy
# Push to main → Vercel auto-deploys
# DB: npx supabase db push (or use Supabase dashboard migrations)
```

## GitHub

- Repo shared with collaborators — everyone works on feature branches, PRs to `main`
- `.env.local` is gitignored — share secrets out-of-band (e.g. password manager or Vercel env dashboard)
- `supabase/migrations/` is committed — this is the source of truth for schema
