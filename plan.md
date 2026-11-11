# Daraja Request Tracker

## Scope
A Vercel-friendly Daraja API request monitoring website with a dashboard, searchable request history, request details, outcome/error inspection, and a small server endpoint for receiving normalized request logs. The UI ships with sample records so it is immediately usable before a live Daraja integration is connected.

## Implementation
- Frontend: React + Vite starter, with a responsive dashboard and detail drawer.
- Backend: Express health endpoint plus `POST /api/requests/track` and `GET /api/requests` endpoints. The tracker endpoint accepts normalized Daraja request/response metadata and currently keeps a bounded in-memory log for the preview; replace with the existing Drizzle database helpers for durable production history.
- Integration boundary: Daraja credentials stay on the server. The caller can POST a completed request record to the tracker endpoint after each Daraja call. No secret is placed in browser code.
- Vercel: `vercel.json` builds the Vite client and server bundle; `api/index.ts` is the Vercel function adapter for the Express app. `.env.example` documents the future database and Daraja variables without containing credentials.

## Project structure
- `client/src/pages/Home.tsx`: dashboard UI, filtering, refresh, details.
- `client/src/index.css`: visual system and responsive layout.
- `server/_core/index.ts`: Express app and request tracking HTTP routes.
- `server/routers.ts`: existing tRPC surface, retained for the starter.
- `drizzle/schema.ts`: user table plus request-log schema for the next persistence step.
- `api/index.ts`: Vercel serverless adapter.
- `vercel.json`: Vercel build/output configuration.

## Design
### Candidate styles
- Terminal editorial: 0.06 — utilitarian operational UI with sharp data hierarchy.
- Soft SaaS neutral: 0.07 — calm cards and familiar dashboard patterns.
- **Chosen: Signal room**: 0.04 — dark navy control-room canvas with lime success signals and coral failure signals.

### Design movement
Signal room / mission-control operations dashboard.

### Core principles
1. Make health visible before details.
2. Use compact density without sacrificing readable spacing.
3. Keep status meaning consistent through color and labels.
4. Make the latest request feel live and actionable.

### Color philosophy
Deep navy creates a stable control-room ground. Lime is reserved for healthy outcomes, amber for pending states, and coral for errors. Off-white text and cool slate surfaces keep long tables comfortable.

### Layout paradigm
A wide asymmetric shell: a narrow operational rail on the left, a main health overview, then a full-width activity log. The detail drawer enters from the right to preserve context.

### Signature elements
- Lime vertical pulse mark beside the Daraja wordmark.
- Monospaced request IDs and timestamps.
- Small live-dot indicators and thin chart bars.

### Interaction philosophy
Interactions should feel immediate and low-friction: refresh is visible, filters stay close to the log, and selecting a row reveals details without leaving the operational context.

### Animation
Use only short opacity/translate transitions for drawer and row hover. Avoid looping motion except the tiny live pulse indicator.

### Typography
Use `DM Sans`-like sans hierarchy through the available system sans stack, with `ui-monospace` for IDs, endpoints and timestamps. Strong uppercase micro-labels anchor the operational feel.

### Brand essence
Daraja request observability for builders who need to see what their M-Pesa integration is doing. Clear, calm, traceable.

### Brand voice
Headlines are direct: “Request health, without the guesswork.” Microcopy is operational: “Live feed · Last 15 minutes” and “Open payload”.

### Wordmark
A compact `D/` signal mark: a lime bar and navy slash, paired with the wordmark “DARTRACK”.

### Signature brand color
Signal lime `#C7F36B`.
