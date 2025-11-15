## Error Analysis
- Logs: `net::ERR_NAME_NOT_RESOLVED` and `net::ERR_ABORTED` for `dtocsglmhgeryrqiddkl.supabase.co` → invalid or unreachable Supabase URL; not a frontend logic error.
- Env usage: `src/integrations/supabase/client.ts:5–14` reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`; throws on missing.
- Data fetch points:
  - Index queries in `src/pages/Index.tsx:100–117,123–140`
  - Templates queries in `src/pages/Templates.tsx:85–92,106–123`
  - Details query in `src/pages/TemplateDetail.tsx:15–32`
- Current mitigations: feature flag gating (`VITE_SUPABASE_ENABLED`), offline fallbacks, error UI. Impact: site works offline; live data disabled until env is fixed.
- Security: service role key was previously in `.env`; now removed. Impact: rotate the leaked service role in Supabase.

## Schema Design (SQL)
- Categories
```sql
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);
create index if not exists idx_categories_name on public.categories(name);
```
- Templates
```sql
create table if not exists public.templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  width_mm int,
  height_mm int,
  dpi int,
  has_bleed boolean default false,
  file_formats text[] default '{}',
  tags text[] default '{}',
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
```
- Download Logs
```sql
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
```
- Trigger to keep `downloads_count` in sync
```sql
create or replace function public.increment_downloads() returns trigger as $$
begin
  update public.templates set downloads_count = downloads_count + 1, updated_at = now()
  where id = new.template_id;
  return new;
end; $$ language plpgsql security definer;

drop trigger if exists trg_increment_downloads on public.download_logs;
create trigger trg_increment_downloads after insert on public.download_logs
for each row execute function public.increment_downloads();
```

## Row-Level Security (RLS)
- Enable RLS
```sql
alter table public.categories enable row level security;
alter table public.templates enable row level security;
alter table public.download_logs enable row level security;
```
- Policies for anonymous (public) access
```sql
-- Categories: read-only for everyone
create policy categories_select_public on public.categories
  for select using (true);

-- Templates: read-only when published
create policy templates_select_published on public.templates
  for select using (is_published = true);

-- Download logs: allow insert limited to fields; no select/update/delete for anon
create policy download_logs_insert_public on public.download_logs
  for insert with check (
    format in ('pdf','svg','png','jpg') and new.template_id is not null
  );
```
- Optional stricter rule: only allow inserts when template is published
```sql
create policy download_logs_insert_if_published on public.download_logs
  for insert with check (
    exists (select 1 from public.templates t where t.id = new.template_id and t.is_published)
  );
```
- Admin policies (service role): bypass RLS by default, or add explicit policies for maintenance roles.

## Quality Assurance
- CRUD tests (SQL and SDK):
  - Categories: insert/list/unique slug constraint enforcement.
  - Templates: insert with valid/invalid fields; verify foreign key to categories; ensure `is_published` gates visibility.
  - Download logs: insert with valid formats; ensure trigger increments `downloads_count` atomically.
- Data integrity:
  - Attempt violating constraints (bad format, missing FK) to confirm rejection.
- Performance:
  - Seed ~1k templates, ~10k logs; verify indexes support queries used in `src/pages/Index.tsx:29–47` and `src/pages/Templates.tsx:31–49`.
- Security:
  - With anon key, confirm:
    - templates/categories are readable
    - unpublished templates not readable
    - only insert allowed on `download_logs` and no select
  - With service role, confirm full access for admin scripts.

## Documentation
- Schema diagrams: export ERD (tables + FKs) from Supabase.
- API patterns:
  - Categories: `select * order name asc`
  - Templates: `select *, category:categories(name, slug) eq is_published true`
  - Logs: RPC via insert into `download_logs` or a secured Postgres function.
- Issue log: document env misconfig root cause, feature flag design, RLS decisions.

## Deployment
- Migrations: store the above SQL in versioned migration files; apply with Supabase CLI (`supabase db push`) or through SQL editor.
- Monitoring: enable Supabase logs, Postgres performance insights; set alerts on long-running queries and error rates.
- Backups: schedule daily backups; validate PITR is enabled; document recovery procedure.

## Immediate Steps For This Project
1. Replace `.env` with valid Supabase project URL and anon key; rotate the previously exposed service role key in Supabase.
2. Apply the schema and RLS SQL to your Supabase project.
3. Set `VITE_SUPABASE_ENABLED="true"` and verify the app loads live data without errors.
4. Keep the trigger-based increment so the client no longer needs to update `downloads_count` manually.

## Deliverables
- Deployed Supabase schema with categories, templates, download_logs tables, indexes, trigger, and RLS policies.
- QA test scripts (SQL and optional Node via `@supabase/supabase-js`) validating CRUD, integrity, security, performance.
- Schema and API documentation, plus an issue resolution report.
- Migration scripts, monitoring setup, and backup procedures.

Confirm to proceed and I’ll implement the schema, policies, and test scaffolding, then enable live data in the app.