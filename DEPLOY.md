# Deploy: Muhandis.uz

## Environment Variables (Vercel Dashboard)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Vercel Postgres or external) |
| `PAYLOAD_SECRET` | Yes | Random secret for Payload CMS auth tokens |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob storage token for image/media uploads |
| `NEXT_PUBLIC_SERVER_URL` | Yes | Public URL of the site (e.g. `https://muhandiss.uz`) |

## Steps

1. **Database** — Provision a Postgres database (Vercel Postgres or Railway). Copy the connection string into `DATABASE_URL`.
2. **Blob Storage** — Enable Vercel Blob in the project dashboard. Copy the read-write token into `BLOB_READ_WRITE_TOKEN`.
3. **Secret** — Generate a random string for `PAYLOAD_SECRET` (e.g. `openssl rand -hex 32`).
4. **Deploy** — Connect the GitHub repo to Vercel. Set the Framework Preset to **Next.js**. Add the four env vars above.
5. **First deploy** — After the initial deploy succeeds, visit `https://<site>/admin` to create the admin user.
6. **Seed** — Run `npm run seed` via a one-off Vercel CLI command or a local script pointed at the production DB to populate categories.

## Notes

- No `next.config.js` changes needed — `next.config.mts` is already configured with `withPayload()`.
- The Vercel Blob adapter is conditionally enabled at runtime — if `BLOB_READ_WRITE_TOKEN` is missing, local filesystem storage is used (for development).
- The Postgres adapter reads `DATABASE_URL` first, falling back to `DATABASE_URI` if unset.
