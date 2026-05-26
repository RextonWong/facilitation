-- ============================================================
-- 001_initial_schema.sql
-- Full schema for Facilitation project tracker
-- ============================================================

-- ── Profiles ────────────────────────────────────────────────
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url  text,
  created_at  timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "users can view any profile"
  on public.profiles for select
  using (true);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);


-- ── Projects ─────────────────────────────────────────────────
create type public.project_type as enum ('individual', 'paired', 'specialisation');

create table public.projects (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text,
  type        public.project_type not null default 'individual',
  owner_id    uuid not null references auth.users(id) on delete cascade,
  created_at  timestamptz not null default now()
);
alter table public.projects enable row level security;

create policy "members can read projects"
  on public.projects for select
  using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = projects.id
        and pm.user_id = auth.uid()
    )
  );

create policy "owners can update projects"
  on public.projects for update
  using (owner_id = auth.uid());

create policy "authenticated users can create projects"
  on public.projects for insert
  with check (auth.uid() = owner_id);

create policy "owners can delete projects"
  on public.projects for delete
  using (owner_id = auth.uid());


-- ── Project Members ──────────────────────────────────────────
create type public.member_role as enum ('owner', 'member');

create table public.project_members (
  project_id  uuid not null references public.projects(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        public.member_role not null default 'member',
  joined_at   timestamptz not null default now(),
  primary key (project_id, user_id)
);
alter table public.project_members enable row level security;

create policy "members can see project members"
  on public.project_members for select
  using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_members.project_id
        and pm.user_id = auth.uid()
    )
  );

create policy "owners can add members"
  on public.project_members for insert
  with check (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_members.project_id
        and pm.user_id = auth.uid()
        and pm.role = 'owner'
    )
    or auth.uid() = user_id  -- joining via invite
  );

create policy "owners can remove members"
  on public.project_members for delete
  using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_members.project_id
        and pm.user_id = auth.uid()
        and pm.role = 'owner'
    )
    or auth.uid() = user_id  -- leave project
  );


-- ── Project Invites ──────────────────────────────────────────
create table public.project_invites (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  code        text not null unique,
  email       text,
  created_by  uuid not null references auth.users(id) on delete cascade,
  expires_at  timestamptz,
  max_uses    integer not null default 1,
  use_count   integer not null default 0
);
alter table public.project_invites enable row level security;

create policy "members can view invites for their projects"
  on public.project_invites for select
  using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_invites.project_id
        and pm.user_id = auth.uid()
    )
  );

-- Anyone can read an invite by code (needed to join via link)
create policy "anyone can lookup invite by code"
  on public.project_invites for select
  using (true);

create policy "owners can create invites"
  on public.project_invites for insert
  with check (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = project_invites.project_id
        and pm.user_id = auth.uid()
        and pm.role = 'owner'
    )
  );

create policy "owners can delete invites"
  on public.project_invites for delete
  using (created_by = auth.uid());


-- ── Sections ─────────────────────────────────────────────────
create table public.sections (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects(id) on delete cascade,
  name        text not null,
  order_index integer not null default 0
);
alter table public.sections enable row level security;

create policy "members can read sections"
  on public.sections for select
  using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = sections.project_id
        and pm.user_id = auth.uid()
    )
  );

create policy "owners can manage sections"
  on public.sections for all
  using (
    exists (
      select 1 from public.project_members pm
      where pm.project_id = sections.project_id
        and pm.user_id = auth.uid()
        and pm.role = 'owner'
    )
  );


-- ── Tasks ─────────────────────────────────────────────────────
create type public.task_status as enum ('todo', 'in_progress', 'done');

create table public.tasks (
  id             uuid primary key default gen_random_uuid(),
  section_id     uuid not null references public.sections(id) on delete cascade,
  parent_task_id uuid references public.tasks(id) on delete cascade,
  title          text not null,
  description    text,
  assignee_id    uuid references auth.users(id) on delete set null,
  status         public.task_status not null default 'todo',
  due_date       date,
  completed_at   timestamptz,
  created_at     timestamptz not null default now()
);
alter table public.tasks enable row level security;

create policy "members can read tasks"
  on public.tasks for select
  using (
    exists (
      select 1 from public.project_members pm
      join public.sections s on s.project_id = pm.project_id
      where s.id = tasks.section_id
        and pm.user_id = auth.uid()
    )
  );

create policy "members can create tasks"
  on public.tasks for insert
  with check (
    exists (
      select 1 from public.project_members pm
      join public.sections s on s.project_id = pm.project_id
      where s.id = tasks.section_id
        and pm.user_id = auth.uid()
    )
  );

create policy "assignee or owner can update tasks"
  on public.tasks for update
  using (
    assignee_id = auth.uid()
    or exists (
      select 1 from public.project_members pm
      join public.sections s on s.project_id = pm.project_id
      where s.id = tasks.section_id
        and pm.user_id = auth.uid()
        and pm.role = 'owner'
    )
  );

create policy "owners can delete tasks"
  on public.tasks for delete
  using (
    exists (
      select 1 from public.project_members pm
      join public.sections s on s.project_id = pm.project_id
      where s.id = tasks.section_id
        and pm.user_id = auth.uid()
        and pm.role = 'owner'
    )
  );


-- ── Task Attachments ─────────────────────────────────────────
create table public.task_attachments (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.tasks(id) on delete cascade,
  uploader_id  uuid not null references auth.users(id) on delete cascade,
  file_path    text not null,
  file_name    text not null,
  file_size    bigint not null,
  mime_type    text not null,
  created_at   timestamptz not null default now()
);
alter table public.task_attachments enable row level security;

create policy "members can read task attachments"
  on public.task_attachments for select
  using (
    exists (
      select 1 from public.project_members pm
      join public.sections s on s.project_id = pm.project_id
      join public.tasks t on t.section_id = s.id
      where t.id = task_attachments.task_id
        and pm.user_id = auth.uid()
    )
  );

create policy "members can add task attachments"
  on public.task_attachments for insert
  with check (
    auth.uid() = uploader_id
    and exists (
      select 1 from public.project_members pm
      join public.sections s on s.project_id = pm.project_id
      join public.tasks t on t.section_id = s.id
      where t.id = task_attachments.task_id
        and pm.user_id = auth.uid()
    )
  );

create policy "uploader can delete task attachments"
  on public.task_attachments for delete
  using (uploader_id = auth.uid());


-- ── Comments ─────────────────────────────────────────────────
create table public.comments (
  id       uuid primary key default gen_random_uuid(),
  task_id  uuid not null references public.tasks(id) on delete cascade,
  user_id  uuid not null references auth.users(id) on delete cascade,
  body     text not null,
  created_at timestamptz not null default now()
);
alter table public.comments enable row level security;

create policy "members can read comments"
  on public.comments for select
  using (
    exists (
      select 1 from public.project_members pm
      join public.sections s on s.project_id = pm.project_id
      join public.tasks t on t.section_id = s.id
      where t.id = comments.task_id
        and pm.user_id = auth.uid()
    )
  );

create policy "members can add comments"
  on public.comments for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.project_members pm
      join public.sections s on s.project_id = pm.project_id
      join public.tasks t on t.section_id = s.id
      where t.id = comments.task_id
        and pm.user_id = auth.uid()
    )
  );

create policy "author can delete comments"
  on public.comments for delete
  using (user_id = auth.uid());


-- ── Messages ─────────────────────────────────────────────────
create table public.messages (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid references public.projects(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  sender_id    uuid not null references auth.users(id) on delete cascade,
  body         text not null,
  created_at   timestamptz not null default now(),
  -- Either project channel or DM, never both null
  constraint messages_channel_check check (
    (project_id is not null and recipient_id is null)
    or (project_id is null and recipient_id is not null)
  )
);
alter table public.messages enable row level security;

create policy "members can read project messages"
  on public.messages for select
  using (
    (project_id is not null and exists (
      select 1 from public.project_members pm
      where pm.project_id = messages.project_id
        and pm.user_id = auth.uid()
    ))
    or
    (recipient_id is not null and (
      sender_id = auth.uid() or recipient_id = auth.uid()
    ))
  );

create policy "members can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and (
      (project_id is not null and exists (
        select 1 from public.project_members pm
        where pm.project_id = messages.project_id
          and pm.user_id = auth.uid()
      ))
      or
      (recipient_id is not null)
    )
  );


-- ── Message Attachments ───────────────────────────────────────
create table public.message_attachments (
  id           uuid primary key default gen_random_uuid(),
  message_id   uuid not null references public.messages(id) on delete cascade,
  uploader_id  uuid not null references auth.users(id) on delete cascade,
  file_path    text not null,
  file_name    text not null,
  file_size    bigint not null,
  mime_type    text not null,
  created_at   timestamptz not null default now()
);
alter table public.message_attachments enable row level security;

create policy "participants can read message attachments"
  on public.message_attachments for select
  using (
    exists (
      select 1 from public.messages m
      where m.id = message_attachments.message_id
        and (
          m.sender_id = auth.uid()
          or m.recipient_id = auth.uid()
          or exists (
            select 1 from public.project_members pm
            where pm.project_id = m.project_id
              and pm.user_id = auth.uid()
          )
        )
    )
  );

create policy "sender can add message attachments"
  on public.message_attachments for insert
  with check (auth.uid() = uploader_id);


-- ── Notifications ─────────────────────────────────────────────
create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null,
  payload    jsonb not null default '{}',
  read_at    timestamptz,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;

create policy "users can read own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid());


-- ── Push Subscriptions ───────────────────────────────────────
create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  endpoint   text not null unique,
  keys       jsonb not null,
  created_at timestamptz not null default now()
);
alter table public.push_subscriptions enable row level security;

create policy "users can manage own push subscriptions"
  on public.push_subscriptions for all
  using (user_id = auth.uid());


-- ── Progress Views ───────────────────────────────────────────
create view public.section_progress as
  select
    s.id as section_id,
    s.project_id,
    s.name,
    count(t.id) filter (where t.parent_task_id is null) as total_tasks,
    count(t.id) filter (where t.parent_task_id is null and t.status = 'done') as completed_tasks,
    case
      when count(t.id) filter (where t.parent_task_id is null) = 0 then 0
      else round(
        100.0 * count(t.id) filter (where t.parent_task_id is null and t.status = 'done')
        / count(t.id) filter (where t.parent_task_id is null)
      )
    end as progress_pct
  from public.sections s
  left join public.tasks t on t.section_id = s.id
  group by s.id, s.project_id, s.name;

create view public.project_progress as
  select
    project_id,
    round(avg(progress_pct)) as overall_pct,
    sum(total_tasks) as total_tasks,
    sum(completed_tasks) as completed_tasks
  from public.section_progress
  group by project_id;

create view public.member_progress as
  select
    pm.project_id,
    pm.user_id,
    p.display_name,
    count(t.id) filter (where t.status = 'done') as completed_tasks,
    count(t.id) as total_tasks,
    case
      when count(t.id) = 0 then 0
      else round(100.0 * count(t.id) filter (where t.status = 'done') / count(t.id))
    end as progress_pct
  from public.project_members pm
  join public.profiles p on p.id = pm.user_id
  left join public.sections s on s.project_id = pm.project_id
  left join public.tasks t on t.section_id = s.id and t.assignee_id = pm.user_id
    and t.parent_task_id is null
  group by pm.project_id, pm.user_id, p.display_name;


-- ── Indexes ───────────────────────────────────────────────────
create index on public.tasks (section_id);
create index on public.tasks (assignee_id);
create index on public.tasks (completed_at) where completed_at is not null;
create index on public.messages (project_id, created_at);
create index on public.messages (sender_id, recipient_id, created_at);
create index on public.notifications (user_id, read_at);
create index on public.project_invites (code);


-- ── Realtime ─────────────────────────────────────────────────
-- Enable realtime for live chat and notifications
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.tasks;
