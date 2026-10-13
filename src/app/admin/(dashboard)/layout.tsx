import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { AdminLogoutButton } from './AdminLogoutButton'
import { switzer } from '@/app/fonts'
import { NIGHT_END_HOUR, NIGHT_START_HOUR } from '@/lib/theme'

const navItems = [
  { href: '/admin/articles', label: 'Articles' },
  { href: '/admin/media', label: 'Media' },
  { href: '/admin/hackathons', label: 'Hackathons' },
  { href: '/admin/quiz', label: 'Quiz' },
  { href: '/admin/projects', label: 'Projects' },
  { href: '/admin/partners', label: 'Partners' },
  { href: '/admin/team', label: 'Team' },
  { href: '/admin/feedback', label: 'Feedback' },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <html lang="uz" className={switzer.variable} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem('theme');var h=new Date().getHours();var d=s==='dark'||s==='light'?s==='dark':(h>=${NIGHT_START_HOUR}||h<${NIGHT_END_HOUR});document.documentElement.classList.toggle('dark',d)}catch(e){}})()` }} /></head>
      <body>
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-border p-4 flex flex-wrap md:flex-col gap-1 shrink-0">
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
        <div className="w-full mt-auto pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2 truncate">{user.email}</p>
          <AdminLogoutButton />
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-3 sm:p-6 overflow-auto">
        {children}
      </main>
    </div>
      </body>
    </html>
  )
}
