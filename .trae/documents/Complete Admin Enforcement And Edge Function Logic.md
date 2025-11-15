## Changes To Implement
- Enforce admin access in AdminLayout so all admin routes are blocked for non-admins with a clear message.
- Enhance edge functions to:
  - Use Supabase client via environment (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
  - Validate JWT from `Authorization` header and check `profiles.role`.
  - Return 403 if not admin/editor where required.
  - For Approvals: update `templates.is_published` and insert an audit log.
  - For Uploads: keep validation but also insert an audit log (storage operations will be connected after bucket setup).
  - For Signed URLs: generate via Supabase Storage (stub if env missing).
- Update admin UI actions to handle responses and refresh lists after approve/reject.

## Verification
- Build succeeds; guard blocks non-admin (disabled mode allows dev).
- Edge functions return appropriate status codes and messages with role checks.
- Admin pages show success feedback and update data upon actions.

I will implement these changes now and keep storage operations as stubs pending bucket configuration and function environment setup.