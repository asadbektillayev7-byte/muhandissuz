/**
 * Creates (or re-activates) the Supabase auth user for the admin panel.
 *
 *   npm run create-admin
 *
 * Reads ADMIN_EMAIL / ADMIN_PASSWORD from .env. ADMIN_EMAIL must match the one
 * the server actions check in src/lib/actions.ts, or writes will be rejected.
 */
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

if (!url || !serviceKey || !email || !password) {
  console.error(
    'Missing env vars. Need NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD.'
  )
  process.exit(1)
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const { data: list, error: listError } = await admin.auth.admin.listUsers()
if (listError) {
  console.error('Could not list users:', listError.message)
  process.exit(1)
}

const existing = list.users.find((u) => u.email === email)

if (existing) {
  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  })
  if (error) {
    console.error('Could not update admin user:', error.message)
    process.exit(1)
  }
  console.log(`Updated existing admin user ${email} (${existing.id})`)
} else {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })
  if (error) {
    console.error('Could not create admin user:', error.message)
    process.exit(1)
  }
  console.log(`Created admin user ${email} (${data.user.id})`)
}

console.log('Log in at /admin/login')
