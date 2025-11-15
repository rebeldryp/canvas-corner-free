## Error/Fault Analysis
- Live data errors originate from misconfigured Supabase env; frontend now gates queries and shows clear messaging. No admin UI exists; implementing it will introduce new auth/RBAC and upload paths that must be validated.

## Architecture Overview
- Auth/Roles: Supabase Auth with `profiles` table storing `role` (`admin`, `editor`, `viewer`) and RLS policies. Admin routes are protected and server-side actions restricted by policies.
- Storage: Supabase Storage buckets:
  - `template-files` (zip/psd/ai; private; served via signed URLs)
  - `template-media` (preview images; public with CDN)
- DB Schema (new tables):
  - `profiles(user_id uuid pk, role text check in ('admin','editor','viewer'))`
  - `template_versions(id uuid pk, template_id uuid fk, version text, file_url text, file_format text, file_size int, checksum text, changelog text, created_by uuid, created_at timestamptz)`
  - `template_media(id uuid pk, template_id uuid fk, image_url text, width int, height int, alt_text text, sort_order int, created_at timestamptz)`
  - `approvals(id uuid pk, template_id uuid fk, status text check in ('pending','approved','rejected'), reviewer_id uuid, notes text, created_at timestamptz)`
  - `audit_logs(id uuid pk, user_id uuid, action text, entity text, entity_id uuid, metadata jsonb, ip_address text, created_at timestamptz)`
  - Extend `templates` with `license text`, `current_version_id uuid fk`, `created_by uuid`, `updated_at timestamptz`
- RLS Policies:
  - `profiles`: user can read own profile; admins can read all; only admins can update roles
  - `templates/template_versions/template_media`: read allowed for published; admin/editor can insert/update; approval gates `is_published`
  - `approvals`: insert by editor; approve/reject by admin
  - `audit_logs`: insert by edge functions; select by admin
- Edge Functions (server-side validation):
  - `uploadTemplate` (validate file type/size ≤50MB; virus scan; store in `template-files`; record `template_versions` and audit)
  - `uploadMedia` (validate image type/dimensions/size ≤5MB; store in `template-media`; record `template_media` and audit)
  - `approveTemplate` (update `approvals` and set `is_published` with audit)
  - `signedUrl` (generate limited-time URLs for private files)

## Admin UI Modules
- Template Management:
  - Upload form (title, description, category/tags, license, version, file)
  - Version list with diff notes; set current version; preview before publish
- Media Carousel Management:
  - Multi-image upload (3–10) with drag-and-drop sorting; alt text per image; lazy loading in previews
- User Access Control:
  - Admin-only settings: view users (from `profiles`), set roles
  - Download analytics dashboard (aggregate `download_logs` by date/format/template)
  - Approval workflow: list pending templates; approve/reject with notes
- Configuration Settings:
  - File size limits (UI + enforced on server)
  - CDN toggles/notes; cache headers

## Technical Requirements
- Responsive desktop/tablet layout with components consistent with existing design system
- Server-side validation in edge functions; client-side prechecks
- Storage security: templates private via signed URLs; media public via CDN; backups enabled in Supabase
- Virus scanning: integrate a scanning service (e.g., cloud antivirus API) asynchronously; block publish until `scan_status = 'clean'`

## Quality Assurance
- Preview before publishing (render media files and non-public template file metadata)
- Version control (immutable `template_versions` rows; `current_version_id` pointer)
- Audit logs for all admin actions with user, IP, metadata
- Test cases: CRUD for templates/media/versions/approvals/users; RLS access checks; file validation; virus scan flow; analytics queries

## Performance Optimization
- Lazy loading images via IntersectionObserver and `<img loading="lazy">`
- Use Supabase CDN for `template-media`; cache headers for popular templates
- React Query caching and SWR for admin lists

## Implementation Phases
1. DB & Storage: create tables, indexes, RLS; create buckets; seed `profiles` with roles
2. Edge Functions: implement upload/approve/signed URL endpoints with validation and audit logging
3. Admin Routes: `/admin` shell, `/admin/templates`, `/admin/templates/:id`, `/admin/approvals`, `/admin/users`, `/admin/analytics`, `/admin/settings`
4. UI Components: forms, carousel manager (drag-and-drop), version manager, approvals list, users list, charts
5. QA & Tests: unit/integration tests; E2E flows; staging verification
6. Deployment: migrations via Supabase CLI; edge functions deploy; monitoring & backups; CDN config

## Rollback
- Migrations reversible; publish flags prevent exposure
- Edge functions versioned; revert to previous; disable admin routes via feature flag if needed

## Deliverables
- Schema + policies SQL; storage buckets and security configuration
- Edge functions for uploads/approvals/signed URLs
- Admin UI with modules listed; responsive design; drag-and-drop carousel
- QA test suite and documentation; monitoring and backup procedures

Approve to proceed and I will implement the schema, policies, edge functions scaffold, and the admin UI routes/components, followed by tests and deployment scripts.