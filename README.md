# Parlai

Voice-first conversational Italian tutor for the household. Talk with Giulia, get a written debrief, and build a shared family context over time.

- **Production:** https://parlai.live
- **GitHub:** https://github.com/4Sighteducation/parlai
- **Supabase project:** `ozptjapwgiiysfuqmjby`
- **Vercel project:** `parlai` (auto-deploys from GitHub)

## Local development

This folder **is** the Git repo — linked to `origin` on GitHub. Clone path:

```text
C:\Users\tonyd\OneDrive - 4Sight Education Ltd\Apps\Parlai
```

```bash
npm install
cp .env.example .env.local   # then fill in secrets
npm run dev
```

Open http://localhost:3000

## Environment variables

See `.env.example`. Required for full functionality:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser Supabase key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only writes (if needed) |
| `OPENAI_API_KEY` | Realtime voice + analysis (server only) |
| `REALTIME_MODEL` | `gpt-realtime-2` |
| `ANALYSIS_MODEL` | `gpt-5.4-mini` (Layer B debrief) |
| `NEXT_PUBLIC_AUTH_PROVIDER` | `google` (default) or `apple` |

Leave `NEXT_PUBLIC_SSO_DOMAIN` empty unless using SAML SSO.

## Deploy

Pushes to `master` on GitHub trigger Vercel. Production branch should be set to **master** in Vercel → Settings → Git.

Manual production deploy:

```bash
vercel deploy --prod
```

## Milestones

| # | Status | What |
|---|--------|------|
| 1 | Done | Scaffold, Supabase, Vercel |
| 2 | Done | Realtime voice (WebRTC) |
| 3 | Done | Auth, schema, session persistence, household context |
| 4 | Done | Reflection loop, debrief, auto-harvest proposals |
| 5 | Next | Inject context into live sessions |
| 6 | Planned | Onboarding / placement |
| 7 | Planned | Polish + cost logging |

## Auth redirect URLs (Supabase)

Add to Supabase → Authentication → URL configuration:

- `https://parlai.live/auth/callback`
- `http://localhost:3000/auth/callback`

Google/Apple OAuth redirect URIs point at Supabase (`…/auth/v1/callback`), not Parlai directly — see setup notes in project chat history.
