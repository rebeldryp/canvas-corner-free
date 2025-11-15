create extension if not exists pgcrypto;

-- Extend templates
alter table public.templates add column if not exists license text;
alter table public.templates add column if not exists current_version_id uuid;
alter table public.templates add column if not exists created_by uuid;

-- Profiles
create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','editor','viewer')),
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists profiles_self_read on public.profiles;
create policy profiles_self_read on public.profiles for select using (auth.uid() = user_id);
drop policy if exists profiles_admin_read on public.profiles;
create policy profiles_admin_read on public.profiles for select using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);
drop policy if exists profiles_admin_update on public.profiles;
create policy profiles_admin_update on public.profiles for update using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
) with check (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);

-- Template Versions
create table if not exists public.template_versions (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  version text not null,
  file_url text not null,
  file_format text not null,
  file_size int not null,
  checksum text,
  changelog text,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_template_versions_template on public.template_versions(template_id);
alter table public.template_versions enable row level security;
drop policy if exists template_versions_public_select on public.template_versions;
create policy template_versions_public_select on public.template_versions for select using (
  exists (select 1 from public.templates t where t.id = template_id and t.is_published)
);
drop policy if exists template_versions_admin_write on public.template_versions;
create policy template_versions_admin_write on public.template_versions for insert with check (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin','editor'))
);
create policy template_versions_admin_update on public.template_versions for update using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin','editor'))
) with check (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin','editor'))
);

-- Template Media
create table if not exists public.template_media (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  image_url text not null,
  width int,
  height int,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_template_media_template on public.template_media(template_id);
alter table public.template_media enable row level security;
drop policy if exists template_media_public_select on public.template_media;
create policy template_media_public_select on public.template_media for select using (
  exists (select 1 from public.templates t where t.id = template_id and t.is_published)
);
drop policy if exists template_media_admin_write on public.template_media;
create policy template_media_admin_write on public.template_media for insert with check (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin','editor'))
);
create policy template_media_admin_update on public.template_media for update using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin','editor'))
) with check (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role in ('admin','editor'))
);


-- Audit Logs
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  action text not null,
  entity text,
  entity_id uuid,
  metadata jsonb,
  ip_address text,
  created_at timestamptz not null default now()
);
create index if not exists idx_audit_logs_action on public.audit_logs(action);
create index if not exists idx_audit_logs_created_at on public.audit_logs(created_at desc);
alter table public.audit_logs enable row level security;
drop policy if exists audit_logs_admin_select on public.audit_logs;
create policy audit_logs_admin_select on public.audit_logs for select using (
  exists (select 1 from public.profiles p where p.user_id = auth.uid() and p.role = 'admin')
);
