<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Parlai is a Next.js 16 + React 19 voice-first Italian tutor backed by Supabase (auth + Postgres) and the OpenAI Realtime API. Standard scripts live in `package.json` (`dev`, `build`, `lint`, `start`); env vars are documented in `README.md` / `.env.example`. Dev server runs on http://localhost:3000.

Non-obvious caveats:
- The whole app is auth-gated by Supabase via `middleware.ts`, which calls Supabase on every route. Without valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`, every page errors (not just protected ones). These two are browser-safe publishable values and can be fetched via the Supabase MCP for project `ozptjapwgiiysfuqmjby` (`get_project_url`, `get_publishable_keys`). `.env.local` is gitignored, so it must be recreated on a fresh VM.
- Login is OAuth-only (Google/Apple through Supabase) — there is no email/password UI. You can verify the flow up to the real Google consent screen without credentials, but reaching `/home`, `/session`, `/onboarding`, `/debrief` requires actually completing sign-in with the household's Google account (e.g. via the Desktop pane).
- Live voice (Layer A) and the post-session debrief (Layer B) need a server-only `OPENAI_API_KEY`. Without it, `/api/realtime-token` returns 500 and the session page cannot start a conversation. `npm run build` and `npm run dev` work fine without it; only Supabase env is required for pages to render.
- `npm run lint` currently reports 3 pre-existing errors (`prefer-const` in `lib/supabase/middleware.ts` and two `no-require-imports` in `scripts/ensure-native-deps.js`). These exist on a clean checkout and are unrelated to your changes.
