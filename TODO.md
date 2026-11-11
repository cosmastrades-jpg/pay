# TODO

## Dashboard health overview
- [ ] Show total, successful, pending, and failed Daraja request counts.
- [ ] Show a recent activity indicator and average response time.

## Request history
- [ ] Show request type, transaction/reference ID, timestamp, status, response time, and result code.
- [ ] Support search by reference ID or endpoint.
- [ ] Support filtering by request type and status.
- [ ] Support manual refresh.

## Request details
- [ ] Open a selected request without leaving the dashboard.
- [ ] Show endpoint, request metadata, response data, result code, timestamps, and readable outcome/error information.

## Tracking API
- [ ] Accept normalized Daraja request/response records at `POST /api/requests/track`.
- [ ] Return request records from `GET /api/requests`.
- [ ] Keep Daraja credentials out of browser code and document server-side environment variables.

## Vercel handoff
- [ ] Include a Vercel build configuration and serverless adapter.
- [ ] Include an `.env.example` without real secrets.
