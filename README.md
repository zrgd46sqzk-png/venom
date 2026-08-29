# Venom

An AI product with two engines behind your own brand:

- **Chat** (`/chat`) — a Claude-powered assistant, using the Anthropic API.
- **Video** (`/video`) — text-to-video generation using ByteDance's Seedance model, via Replicate.

This is an MVP: no auth, billing, or rate limiting yet. Both API calls happen server-side in Next.js route handlers, so your API keys never reach the browser.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and fill in your keys:

   ```bash
   cp .env.example .env.local
   ```

   - `ANTHROPIC_API_KEY` — from https://console.anthropic.com/settings/keys
   - `REPLICATE_API_TOKEN` — from https://replicate.com/account/api-tokens

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Open http://localhost:3000.

## How it's wired

- `src/lib/anthropic.ts` / `src/lib/replicate.ts` — thin client wrappers reading the API keys from env vars.
- `src/app/api/chat/route.ts` — streams a chat completion from Claude as plain text.
- `src/app/api/video/route.ts` — starts a Seedance video generation job on Replicate and returns a prediction id.
- `src/app/api/video/[id]/route.ts` — polled by the client to check job status until the video is ready.
- `src/app/chat/page.tsx`, `src/app/video/page.tsx` — the two product UIs.

## Notes before going further

- The Seedance input fields (`duration`, `resolution`, `aspect_ratio`, …) sent in `src/app/api/video/route.ts` follow the model's published schema at the time of writing — double check https://replicate.com/bytedance/seedance-1-lite for the current schema before relying on it.
- "Claude" and "Seedance" are Anthropic's and ByteDance's own trademarks — this product calls their APIs but ships under its own brand name, not theirs.
- Add authentication, usage limits, and billing before letting untrusted users hit `/api/chat` or `/api/video` — both cost money per call.

## Deploy

Works on Vercel like any Next.js app — set the two environment variables above in your Vercel project settings.
