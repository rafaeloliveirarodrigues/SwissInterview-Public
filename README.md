# Swiss Interview

Swiss-market AI interview preparation and application tools.

Product: [swissinterview.com](https://swissinterview.com) · Investor overview: [TEASER.md](./TEASER.md)

## Product

- CV upload, job-description analysis, company research and spoken mock interviews.
- Answer scores, improvement plans, PDF exports, speech delivery metrics and single-question practice.
- Swiss CV and Arbeitszeugnis review.
- Salary budgeting with user-entered official tax estimates, pension and insurance inputs—not an automated canton tax engine.
- Monthly RAV preparation reports from confirmed applications—not automatic official submissions.
- English, German, French and Italian interfaces.
- Three free full interviews; matched Buy Me a Coffee payments reset the balance to three. Promotional codes provide additional interviews; no subscription tiers.

## Privacy

Video preview and optional replay stay in browser memory and are discarded at interview end or exit. Video is not uploaded. Audio-only recordings may be sent for transcription. CVs, transcripts and reports are processed by application services; application records are owner-scoped. The app includes multilingual legal pages, privacy consent, account export and deletion, and inactive-account cleanup.

Never commit real CVs, private application records, database exports or credentials.

## Development

TanStack Start, React, TypeScript, Tailwind CSS, Lovable Cloud and server-side Lovable AI calls. Production server code targets Cloudflare Workers.

Install [Bun](https://bun.sh), then:

```sh
bun install --frozen-lockfile
bun run dev
```

This source snapshot does not reproduce the hosted backend. Configure your own authentication, database access and server secrets. Browser configuration uses `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` and `VITE_SUPABASE_PROJECT_ID`. AI requires server-only `LOVABLE_API_KEY`; coffee notifications require server-only `BMC_WEBHOOK_SECRET`. Never reuse production credentials.

Schema and migrations live in `drizzle/`. Git sync does not apply migrations. Reviewing this source does not require production credentials or user data.

### Checks

```sh
bunx vitest run src/lib/career-tools.test.ts src/lib/swiss-cv.test.ts src/lib/local-video.test.ts src/lib/privacy.test.ts
bun run lint
```

Hosting elsewhere requires independently configured services and a compatible server runtime.

## Licence

[PolyForm Noncommercial License 1.0.0](./LICENSE).

You may copy, share, study and adapt this code for non-commercial purposes only. Commercial use requires written permission from the author (rafaelrodriguesedp@gmail.com). Third-party dependencies retain their own licences. This is source-available under a noncommercial licence, not an OSI-approved open-source licence.

## Public source snapshot

This repository contains a cleaned source snapshot with fresh history. Environment files, internal planning documents, internal roadmaps, agent instructions, dependencies and generated deployment output are excluded. The working repository remains private. The public copy is not automatically synchronized with future product changes.
