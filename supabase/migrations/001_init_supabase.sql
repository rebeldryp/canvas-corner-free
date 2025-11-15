-- Enable required extensions
create extension if not exists pgcrypto;

-- Categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);
create index if not exists idx_categories_name on public.categories(name);

-- Templates
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  width_mm int,
  height_mm int,
  dpi int,
  has_bleed boolean default false,
  file_formats text[] not null default '{}'::text[],
  tags text[] not null default '{}'::text[],
  preview_url text not null,
  source_file_url text not null,
  is_published boolean not null default false,
  downloads_count int not null default 0,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_templates_published on public.templates(is_published);
create index if not exists idx_templates_category on public.templates(category_id);
create index if not exists idx_templates_downloads on public.templates(downloads_count desc);
create index if not exists idx_templates_created_at on public.templates(created_at desc);

-- Updated-at trigger
create or replace function public.set_updated_at() returns trigger as $$
begin
  new.updated_at := now();
  return new;
end; $$ language plpgsql;

drop trigger if exists trg_templates_set_updated_at on public.templates;
create trigger trg_templates_set_updated_at before update on public.templates
for each row execute function public.set_updated_at();

-- Download Logs
create table if not exists public.download_logs (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.templates(id) on delete cascade,
  format text not null check (format in ('pdf','svg','png','jpg')),
  ip_address text,
  user_id uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_download_logs_template on public.download_logs(template_id);
create index if not exists idx_download_logs_created_at on public.download_logs(created_at desc);

-- Atomic increment of downloads_count
create or replace function public.increment_downloads() returns trigger as $$
begin
  update public.templates set downloads_count = downloads_count + 1, updated_at = now()
  where id = new.template_id;
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists trg_increment_downloads on public.download_logs;
create trigger trg_increment_downloads after insert on public.download_logs
for each row execute function public.increment_downloads();

-- Row Level Security
alter table public.categories enable row level security;
alter table public.templates enable row level security;
alter table public.download_logs enable row level security;

-- Public read of categories
drop policy if exists categories_select_public on public.categories;
create policy categories_select_public on public.categories
  for select using (true);

-- Public read of published templates
drop policy if exists templates_select_published on public.templates;
create policy templates_select_published on public.templates
  for select using (is_published = true);

-- Public insert of download logs (limited)
drop policy if exists download_logs_insert_public on public.download_logs;
create policy download_logs_insert_public on public.download_logs
  for insert with check (
    format in ('pdf','svg','png','jpg') and template_id is not null
  );

-- Optional stricter insert: only if template is published
drop policy if exists download_logs_insert_if_published on public.download_logs;
create policy download_logs_insert_if_published on public.download_logs
  for insert with check (
    exists (
      select 1 from public.templates t
      where t.id = template_id and t.is_published
    )
  );
