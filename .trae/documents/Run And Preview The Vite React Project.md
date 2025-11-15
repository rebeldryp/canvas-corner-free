## Preview Options
- Dev server: `npm run dev` serves at `http://localhost:8080` (from `vite.config.ts:10`).
- Built preview: `npm run build` then `npm run preview` serves at `http://localhost:4173`.
- Netlify (optional): `npx netlify dev` uses SPA redirects and `netlify.toml:13–16` (port 5173) if you prefer simulating Netlify locally.

## What I Will Do
1. Install dependencies with `npm install`.
2. Start the dev server via `npm run dev` and open `http://localhost:8080` for live preview.
3. Alternatively, build and preview the production build using `npm run build` then `npm run preview` and open `http://localhost:4173`.
4. Verify that the app mounts to `#root` and loads `src/main.tsx` (`index.html:21–22`).
5. Confirm environment variables from `.env` load via Vite (used in `src/integrations/supabase/client.ts:5–6`) without exposing any secrets.

## Ports & Config
- Dev server host/port: `vite.config.ts:9–11` → `host "::"`, `port 8080`.
- Scripts: `package.json:7–11` → `dev`, `build`, `preview`.
- SPA redirects (deployment only): `netlify.toml:8–11`.

## After Confirmation
- I will run the chosen command, launch the local server, and provide a clickable preview URL in the IDE for you to open immediately.