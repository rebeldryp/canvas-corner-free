## Issues Found
- Security exposure: `.env` contains `VITE_SUPABASE_SERVICE_ROLE_KEY` which is sent to the browser. Frontend must never include service role keys.
- Dev mismatch: `netlify.toml:15` dev `port = 5173` conflicts with `vite.config.ts:10` dev server `port = 8080`.
- Runtime robustness: Several fields from Supabase can be `null` (e.g., `downloads_count`, `file_formats`). Current code uses them without guards, risking runtime errors:
  - `TemplateCard.tsx:52` `downloads.toLocaleString()` when `downloads` can be `null`.
  - `TemplateCard.tsx:44` `formats.slice(...)` when `formats` can be `null`.
  - `TemplateDetail.tsx:161` `template.file_formats.length` when `file_formats` can be `null`.
  - `TemplateDetail.tsx:45–46` increments `downloads_count` without null-safe default.
- Bundle size: Production build warns about >500kB chunk; route-level code splitting and vendor chunking can improve load.

## Plan To Fix
1. Align Netlify dev port with Vite server (set Netlify dev `port = 8080`).
2. Add null-safe defaults for template fields in `Index.tsx`, `Templates.tsx`, and `TemplateDetail.tsx`.
3. Remove `VITE_SUPABASE_SERVICE_ROLE_KEY` from `.env` and advise rotating the key in Supabase.
4. Lazy-load pages with `React.lazy` and `Suspense` to split bundles.
5. Add Vite Rollup `manualChunks` to split vendor bundles (React, Supabase, Radix, TanStack, Lucide) for faster initial load.

## Implementation Steps
- Edit `netlify.toml` dev port to `8080`.
- Update mappings and UI to default `downloads_count` to `0` and `file_formats` to `[]`; fix increment logic in `TemplateDetail`.
- Remove the sensitive service role key from `.env` (frontend).
- Convert `src/App.tsx` to lazy-loaded routes with a minimal fallback.
- Extend `vite.config.ts` with `build.rollupOptions.output.manualChunks` using an id-based splitter for `@radix-ui`.
- Rebuild and preview the app, then share a working URL.

## Verification
- Run production build, start preview server, load the app, and exercise pages.
- Confirm no runtime errors when templates have `null` fields.
- Confirm Netlify dev compatibility if used.
- Confirm bundle warning reduced and routes code-split.

## Notes
- Service role key must be rotated in Supabase dashboard immediately; removing it from the frontend prevents further exposure, but rotation is required to revoke leaked credentials.