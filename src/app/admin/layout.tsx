import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminLogoutButton } from './AdminLogoutButton'

const navItems = [
  { href: '/admin/articles', label: 'Articles' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/hackathons', label: 'Hackathons' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/partners', label: 'Partners' },
  { href: '/admin/team', label: 'Team' },
  { href: '/admin/feedback', label: 'Feedback' },
  { href: '/admin/testimonials', label: 'Testimonials' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/admin/login')

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="w-56 border-r border-border p-4 flex flex-col gap-1 shrink-0">
        <Link href="/admin" className="text-lg font-bold mb-4 block">Muhandiss.uz</Link>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1.5 px-2 rounded hover:bg-muted"
          >
            {item.label}
          </Link>
        ))}
        <div className="mt-auto pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 truncate">{session.user.email}</p>
          <AdminLogoutButton />
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
