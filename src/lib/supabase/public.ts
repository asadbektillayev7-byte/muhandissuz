import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Read-only client for public pages.
 *
 * The client in ./server.ts reads cookies(), which opts every route that
 * touches it into dynamic rendering — that is why every public page was
 * served `cache-control: no-store` and paid a full server render plus a
 * Supabase round-trip on each navigation.
 *
 * Public content is the same for everybody, so it needs no session. Reading
 * through this client keeps a page statically renderable, which lets
 * `revalidate` below apply and the CDN serve it.
 *
 * Do NOT use this anywhere that depends on the signed-in admin: it carries no
 * session, so RLS sees an anonymous caller.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

/**
 * How long a public page may be served from cache before it is rebuilt, in
 * seconds. Content here changes a few times a week at most, so ten minutes is
 * generous; publishing something new shows up within that window.
 */
export const PUBLIC_REVALIDATE = 600
