## Goals
- Add Supabase migrations for profiles, template_versions, template_media, approvals, and audit_logs with RLS and indexes.
- Scaffold Supabase Edge Functions for uploadTemplate, uploadMedia, approveTemplate, signedUrl to support server-side validation, approvals, and secure delivery.
- Wire admin UI to call edge functions (stub responses until functions are fully deployed).

## Changes
1. Database migrations:
- Create tables: profiles, template_versions, template_media, approvals, audit_logs.
- Extend templates: license, current_version_id, created_by.
- Add indexes and enable RLS with policies for admin/editor access and public reads where appropriate.
2. Edge Functions scaffolds:
- Create function files under supabase/functions/* with minimal Deno handlers that parse JSON and return stub responses.
3. Admin UI wiring:
- Update AdminTemplates submit to invoke uploadTemplate.
- Update AdminTemplateEdit save to invoke uploadMedia.
- Update AdminApprovals buttons to invoke approveTemplate.

## Verification
- Migrations apply cleanly in Supabase SQL editor or via CLI.
- Admin UI shows success messages when edge functions are invoked (in stub mode).