# Deploy: Muhandis.uz

## Environment Variables (Vercel Dashboard)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | Yes | PostgreSQL connection string (Vercel Postgres or external) |
| `PAYLOAD_SECRET` | Yes | Random secret for Payload CMS auth tokens |
| `S3_BUCKET` | Yes | Supabase S3 bucket name (e.g. `media`) |
| `S3_ENDPOINT` | Yes | Supabase S3 endpoint URL (e.g. `https://<project>.supabase.co/storage/v1/s3`) |
| `S3_REGION` | Yes | S3 region (e.g. `us-east-1` for Supabase) |
| `S3_ACCESS_KEY_ID` | Yes | Supabase S3 access key |
| `S3_SECRET_ACCESS_KEY` | Yes | Supabase S3 secret key |
| `NEXT_PUBLIC_SERVER_URL` | Yes | Public URL of the site (e.g. `https://muhandiss.uz`) |

## Steps

1. **Database** — Provision a Postgres database (Supabase, Railway, etc.). Copy the connection string into `DATABASE_URL`.
2. **S3 Storage** — In Supabase, enable S3-compatible storage in the Storage settings. Create a bucket. Copy the endpoint, region, access key, and secret key into the env vars above.
3. **Secret** — Generate a random string for `PAYLOAD_SECRET` (e.g. `openssl rand -hex 32`).
4. **Deploy** — Connect the GitHub repo to Vercel. Set the Framework Preset to **Next.js**. Add all env vars above.
5. **First deploy** — After the initial deploy succeeds, visit `https://<site>/admin` to create the admin user.
6. **Seed** — Run `npm run seed` via a one-off Vercel CLI command or a local script pointed at the production DB to populate categories.

## Notes

- No `next.config.js` changes needed — `next.config.mts` is already configured with `withPayload()`.
- The S3 adapter is conditionally enabled at runtime — if `S3_BUCKET` + `S3_ACCESS_KEY_ID` + `S3_SECRET_ACCESS_KEY` are all set, local filesystem storage is bypassed. For local dev, leave them unset.
- The Postgres adapter reads `DATABASE_URL` first, falling back to `DATABASE_URI` if unset.
