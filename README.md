# DARTRACK — Daraja observability

DARTRACK is a React + Express dashboard for monitoring Daraja requests. It includes a request history table, health metrics, filters, a detail drawer, and server-side tracking endpoints.

## Deploy to Vercel

1. Copy this folder into a GitHub repository.
2. Import the repository into Vercel. The included `vercel.json` already points Vercel at the Vite build and the `/api/index.ts` serverless function.
3. In Vercel Project Settings → Environment Variables, add `DATABASE_URL` for a MySQL-compatible database if you want request history to survive deployments and serverless instance changes.
4. Run `pnpm install` locally, then `pnpm db:push` once against the configured database. Copy `.env.example` to `.env` locally when running the migration.
5. Add Daraja secrets as server-only environment variables. Do not use the `VITE_` prefix for these values.

## Track a request

After your server makes a Daraja call, send a normalized record to:

```bash
curl -X POST https://YOUR_DOMAIN/api/requests/track \
  -H 'content-type: application/json' \
  -d '{
    "type": "STK Push",
    "reference": "ws_CO_120326_2041",
    "endpoint": "/mpesa/stkpush/v1/processrequest",
    "status": "success",
    "resultCode": "0",
    "resultDescription": "The service request is processed successfully.",
    "responseMs": 842,
    "requestMeta": { "amount": 1250, "phone": "2547••••198" },
    "responseData": { "ResponseCode": "0" }
  }'
```

Read the latest records with `GET /api/requests`. The server keeps a bounded in-memory fallback when `DATABASE_URL` is not configured; use the database path for production persistence.

## Local commands

```bash
pnpm install
pnpm check
pnpm dev
pnpm build
```

The dashboard intentionally ships with safe sample data so the UI is useful before a Daraja callback or proxy is connected. The Daraja consumer key, secret, passkey, shortcode, and callback URL belong on the server only.

The original starter also retains its tRPC/auth scaffolding for future workspace authentication.
