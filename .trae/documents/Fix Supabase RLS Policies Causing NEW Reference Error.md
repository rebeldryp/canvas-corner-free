## Root Cause
- `ERROR: 42P01: missing FROM-clause entry for table "new"` occurs because `NEW` is only valid in trigger functions, not in RLS policies. In policies, refer directly to row columns without `NEW`/`OLD`.

## Fix Plan
1. Replace `NEW.column` with plain `column` in all policy definitions.
2. Reapply the policies on the Supabase SQL editor (or via CLI) after enabling RLS on tables.
3. Update the repo migration file to use the corrected policy statements to keep source of truth aligned.

## Correct SQL (Use This In Supabase)
- Enable RLS (if not already):
```
alter table public.categories enable row level security;
alter table public.templates enable row level security;
alter table public.download_logs enable row level security;
```
- Policies:
```
-- Categories: read-only for everyone
drop policy if exists categories_select_public on public.categories;
create policy categories_select_public on public.categories
  for select using (true);

-- Templates: read-only when published
drop policy if exists templates_select_published on public.templates;
create policy templates_select_published on public.templates
  for select using (is_published = true);

-- Download logs: allow insert limited to fields; no select/update/delete for anon
drop policy if exists download_logs_insert_public on public.download_logs;
create policy download_logs_insert_public on public.download_logs
  for insert with check (
    format in ('pdf','svg','png','jpg') and template_id is not null
  );

-- Optional stricter rule: only allow insert if template is published
drop policy if exists download_logs_insert_if_published on public.download_logs;
create policy download_logs_insert_if_published on public.download_logs
  for insert with check (
    exists (select 1 from public.templates t where t.id = template_id and t.is_published)
  );
```

## After Confirmation
- I will update the migration file in the repo to reflect these corrections so migrations run cleanly in all environments.