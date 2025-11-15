# Project Requirement Document (PRD) — Canvas Corner

## 1. Overview
- Canvas Corner is a template catalog site for printable designs. The public can browse, view and download templates; a single owner-admin manages content via an admin dashboard.
- Tech stack: `Vite`, `React`, `TypeScript`, `Tailwind CSS`, `@tanstack/react-query`, `react-router-dom`, `Supabase` (Postgres + Auth + Storage + Edge Functions).

## 2. Objectives
- Deliver a fast, stable catalog with clear template discovery and detail views.
- Provide a secure owner-only admin experience to upload, version, and manage templates/media.
- Maintain robust behavior when Supabase is disabled (no unsafe fallbacks; admin content is blocked).

## 3. Scope
- Public site: home, catalog listing, template detail.
- Admin site: dashboard, templates CRUD, versioning, media management, basic settings and analytics.
- Supabase-backed persistence for templates, categories, versions, media, logs (when enabled).

## 4. Personas & Roles
- Visitor: browses catalog, views details, downloads public assets.
- Owner-Admin: `teforamokate48@gmail.com` (current enforced owner). Full admin access.
- Future Roles (schema-ready, may be added later): `editor`, `viewer`.

## 5. Key User Journeys
- Visitor
  - Browse templates with filters and categories.
  - Open template detail and preview.
  - Initiate download (record logs when enabled).
- Owner-Admin
  - Log in (if Supabase enabled).
  - Access admin dashboard; upload new template with metadata, version label, and media.
  - Edit template details, attach media, manage versions.
  - Review basic analytics and logs.

## 6. Functional Requirements
- Public
  - Home page shows featured content and navigation.
  - Templates listing with cards, categories, and optional tags.
  - Template detail: title, preview image, description, tags, formats, dimensions.
  - 404 for unknown routes.
- Admin
  - Dashboard landing (guarded, owner-only).
  - Upload Template form fields: `Title`, `Description`, `Category`, `Tags (CSV)`, `License`, `Version` (e.g., `1.0.0`), `File`.
  - Templates list and edit page; version and media management.
  - Analytics page: basic charts or counts (downloads, templates), when data available.
  - Settings: key configuration surfaces (non-secret), copy and UI-only toggles.
  - Optional Users page: read-only view into `profiles` (limited to `user_id`, `role`).

## 7. Admin Access Control
- UI Guard: do not render admin layout for non-owner.
- Route Guard: wrap admin routes with a check that redirects non-owners to `/login`.
- Owner enforcement: only `teforamokate48@gmail.com` should pass admin checks.
- Supabase disabled: admin should be blocked; never grant access by fallback.

## 8. Data Model (Supabase)
- `public.templates`: core template metadata: `id`, `title`, `description`, `category_id`, `preview_url`, `source_file_url`, `tags[]`, `is_published`, `created_at`, `updated_at`, optional `license`, `current_version_id`, `created_by`.
- `public.categories`: `id`, `name`, `slug`, optional `description`.
- `public.template_versions`: `id`, `template_id`, `version`, `file_url`, `file_format`, `file_size`, `checksum`, `changelog`, `created_by`, `created_at`.
- `public.template_media`: `id`, `template_id`, `image_url`, `width`, `height`, `alt_text`, `sort_order`, `created_at`.
- `public.download_logs`: `id`, `template_id`, `user_id`, `format`, `ip_address`, `created_at`.
- `public.profiles`: `user_id`, `role`, `created_at`.

## 9. Integrations
- Supabase Client: initialized only when `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are set and `VITE_SUPABASE_ENABLED !== 'false'`.
- Edge Functions (future/optional): `uploadTemplate`, `finalizeTemplate`, `uploadMedia`, `finalizeMedia`, `signedUrl`, `approveTemplate`, `setRole`.
- Storage: stores template source files and media assets.

## 10. Security & Privacy
- RLS policies secure reads/writes for admin tables.
- Owner-only admin via UI and route guards; explicit email match.
- No fallback admin mode when Supabase is disabled.
- Avoid exposing secrets in client; use publishable keys.

## 11. Routing
- Public
  - `/` Home
  - `/templates` Listing
  - `/template/:id` Detail
  - `*` NotFound
- Auth/Admin
  - `/login`
  - `/admin` Dashboard (guarded)
  - `/admin/templates` List (guarded)
  - `/admin/templates/:id` Edit (guarded)
  - `/admin/analytics` (guarded)
  - `/admin/settings` (guarded)
  - Optional: `/admin/users` (guarded)

## 12. Environment & Configuration
- `VITE_SUPABASE_URL`: Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY`: public client key
- `VITE_SUPABASE_ENABLED`: set to `'false'` to disable integration
- Client code must behave safely when any variable is missing (no implicit admin access).

## 13. Error Handling
- Global Error Boundary wraps the app.
- Admin actions show inline error/success feedback.
- Query guards: avoid executing Supabase queries when client is `null`.

## 14. Non-Functional Requirements
- Performance: responsive UI, minimal bundle size, image optimization.
- Accessibility: semantic HTML, keyboard navigation, focus management.
- Reliability: graceful when Supabase disabled; no leaking of protected content.
- Maintainability: typed APIs, clear component boundaries, consistent folder structure.

## 15. Analytics & Observability
- Download logs and aggregates for analytics.
- Client-side events for admin operations (optional).
- Basic dashboard metrics sourced from tables when available.

## 16. Testing & QA
- Route guard tests: non-owner redirected from `/admin*` to `/login`.
- UI guard tests: admin layout never renders for non-owner.
- Supabase disabled tests: admin access fully blocked; public pages still render.
- Upload flow tests: validation and success path; navigation to edit page when `templateId` is returned.

## 17. Release Plan
- M0: Baseline public pages and routing.
- M1: Admin guard (UI + route), layout and dashboard.
- M2: Upload Template with version label and media; Supabase storage wiring.
- M3: Template edit page, versions, media management.
- M4: Analytics and logs integration.
- M5: QA pass, accessibility, performance tuning.

## 18. Risks & Mitigations
- Supabase unavailability: show disabled messaging; block admin features.
- RLS misconfiguration: regularly validate with policies and role checks.
- Asset handling: large files; add size/type validations and post-upload finalization.
- Single-owner assumption: future RBAC migration plan if new admins are added.

## 19. Acceptance Criteria
- Non-owner trying `/admin` is redirected to `/login` and cannot mount admin components.
- If Supabase is disabled, admin routes never render content; public pages remain functional.
- Upload Template form:
  - Validates required fields.
  - Accepts version labels (e.g., `1.0.0`).
  - On success, shows confirmation and navigates to `/admin/templates/:id` when backend returns `templateId`.
- Template detail displays title, preview, description, categories/tags, and file formats.
- 404 route renders for unknown paths.

## 20. Out of Scope (Current Phase)
- Multi-tenant admin panel.
- Comprehensive role management UI (editor/viewer assignment).
- Payment and licensing enforcement.
- Server-side rendering.